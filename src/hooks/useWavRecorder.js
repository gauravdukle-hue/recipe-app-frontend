import { useState, useRef, useCallback, useEffect } from 'react';

const TARGET_RATE = 16000;
const BUFFER_SIZE = 4096;

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);              // PCM
  view.setUint16(22, 1, true);              // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);              // block align
  view.setUint16(34, 16, true);             // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Records 16 kHz mono WAV in the browser, including iPad Safari.
 *
 * Returns: { status, start, stop, reset, blob, url, duration, level, error }
 *   status: 'idle' | 'recording' | 'ready'
 *
 * start() MUST be called directly from a click/tap handler, not from an
 * effect or after an await, or iOS leaves the AudioContext suspended.
 */
export function useWavRecorder() {
  const [status, setStatus] = useState('idle');
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState(null);

  const ctxRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const gainRef = useRef(null);

  const chunksRef = useRef([]);
  const totalRef = useRef(0);
  const recordingRef = useRef(false);
  const urlRef = useRef(null);

  const teardown = useCallback(() => {
    recordingRef.current = false;
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      try { processorRef.current.disconnect(); } catch { /* already gone */ }
    }
    if (gainRef.current) { try { gainRef.current.disconnect(); } catch { /* already gone */ } }
    if (sourceRef.current) { try { sourceRef.current.disconnect(); } catch { /* already gone */ } }
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (ctxRef.current) { try { ctxRef.current.close(); } catch { /* already closed */ } }
    processorRef.current = gainRef.current = sourceRef.current = null;
    streamRef.current = ctxRef.current = null;
    setLevel(0);
  }, []);

  // Release the mic if the component unmounts mid-recording.
  useEffect(() => () => {
    teardown();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, [teardown]);

  const start = useCallback(async () => {
    setError(null);

    // Build the AudioContext synchronously, before any await. Awaiting
    // getUserMedia first lets the user gesture expire and iOS Safari leaves
    // the context suspended permanently.
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { setError('This browser does not support audio recording.'); return; }

    const ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    ctxRef.current = ctx;

    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setUrl(null);
    setBlob(null);
    setDuration(0);
    chunksRef.current = [];
    totalRef.current = 0;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Allow it in Settings, then try again.'
          : 'No microphone available.'
      );
      teardown();
      return;
    }

    streamRef.current = stream;
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
    sourceRef.current = source;
    processorRef.current = processor;

    const ratio = ctx.sampleRate / TARGET_RATE;
    let carry = 0, acc = 0, accCount = 0;

    processor.onaudioprocess = (e) => {
      if (!recordingRef.current) return;
      const input = e.inputBuffer.getChannelData(0);

      // Downsample here, not afterward. Holding raw 48 kHz floats for a long
      // recipe uses enough memory that iOS Safari kills the tab.
      const out = new Float32Array(Math.ceil(input.length / ratio) + 1);
      let n = 0, peak = 0;

      for (let i = 0; i < input.length; i++) {
        const v = input[i];
        const a = v < 0 ? -v : v;
        if (a > peak) peak = a;
        acc += v;
        accCount++;
        carry += 1;
        if (carry >= ratio) {
          out[n++] = acc / accCount;
          acc = 0;
          accCount = 0;
          carry -= ratio;
        }
      }

      chunksRef.current.push(out.subarray(0, n));
      totalRef.current += n;
      setLevel(Math.min(1, peak * 1.8));
    };

    // Route through a zero-gain node. The processor needs a path to
    // destination to keep firing, but connecting it directly sends the mic
    // to the speaker and causes feedback on iPad.
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gainRef.current = gain;

    source.connect(processor);
    processor.connect(gain);
    gain.connect(ctx.destination);

    recordingRef.current = true;
    setStatus('recording');
  }, [teardown]);

  const stop = useCallback(() => {
    if (!recordingRef.current) return null;
    recordingRef.current = false;

    const total = totalRef.current;
    const merged = new Float32Array(total);
    let offset = 0;
    for (const chunk of chunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    chunksRef.current = [];
    teardown();

    if (total === 0) {
      setError('Nothing was recorded. Check the microphone and try again.');
      setStatus('idle');
      return null;
    }

    const wav = encodeWav(merged, TARGET_RATE);
    const objectUrl = URL.createObjectURL(wav);
    urlRef.current = objectUrl;

    setBlob(wav);
    setUrl(objectUrl);
    setDuration(total / TARGET_RATE);
    setStatus('ready');
    return wav;
  }, [teardown]);

  const reset = useCallback(() => {
    teardown();
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    chunksRef.current = [];
    totalRef.current = 0;
    setBlob(null);
    setUrl(null);
    setDuration(0);
    setError(null);
    setStatus('idle');
  }, [teardown]);

  return { status, start, stop, reset, blob, url, duration, level, error };
}
