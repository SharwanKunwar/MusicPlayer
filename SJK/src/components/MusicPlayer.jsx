import React, { useState, useRef, useEffect } from "react";
import { Modal, List, Button } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";

export default function MusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playlistVisible, setPlaylistVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [gradientSpeed, setGradientSpeed] = useState(10); // dynamic speed

  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const [audioURL, setAudioURL] = useState(null); // store URL once

  const openFolder = () => inputRef.current.click();

  const handleFolder = (e) => {
    const files = Array.from(e.target.files);
    const mp3Files = files.filter((file) =>
      file.name.toLowerCase().endsWith(".mp3")
    );
    setSongs(mp3Files);
    setCurrentIndex(null);
    setPlaying(false);
    setProgress(0);
    setAudioURL(null);
  };

  const playSong = (index) => {
    setCurrentIndex(index);
    setPlaying(true);
    setPlaylistVisible(false);

    const url = URL.createObjectURL(songs[index]);
    setAudioURL(url);
    setProgress(0);
    setDuration(0);

    setTimeout(() => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }, 0);
  };

  const playPause = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const nextSong = () => {
    if (!songs.length) return;
    const next = (currentIndex + 1) % songs.length;
    playSong(next);
  };

  const prevSong = () => {
    if (!songs.length) return;
    const prev = (currentIndex - 1 + songs.length) % songs.length;
    playSong(prev);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleSeek = (e) => {
    if (audioRef.current) audioRef.current.currentTime = e.target.value;
    setProgress(e.target.value);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const currentSong = songs[currentIndex];

  // Gradient animation speed linked to audio amplitude
  useEffect(() => {
    if (!audioRef.current) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setGradientSpeed(5 + avg / 30); // faster when music is louder
      requestAnimationFrame(tick);
    };
    tick();
  }, [audioURL]);

  useEffect(() => {
    if (audioRef.current && playing) audioRef.current.play().catch(() => {});
  }, [audioURL, playing]);

  return (
    <div className="bg-black h-screen p-5 flex flex-col gap-3">
      {/* Top */}
      <div className=" h-[8%] flex justify-between px-5 items-center">
        <div>
          <Button size="large" type="primary" onClick={openFolder}>
            Open Folder
          </Button>
          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            multiple
            webkitdirectory="true"
            onChange={handleFolder}
          />
        </div>

        <div>
          <Button
            size="large"
            icon={<UnorderedListOutlined />}
            onClick={() => setPlaylistVisible(true)}
          >
            Playlist
          </Button>
        </div>
      </div>

      {/* Middle */}
      <div className=" h-[80%] flex flex-col justify-center items-center gap-5 w-full">
        {currentSong ? (
          <>
            {/* Animated Gradient Box */}
            <div
              className="h-[300px] w-[90%] rounded-xl mb-5"
              style={{
                background: `linear-gradient(270deg, #6366f1, #ec4899, #6366f1)`,
                backgroundSize: "600% 600%",
                animation: `gradientMove ${gradientSpeed}s ease infinite`,
              }}
            ></div>

            <style>{`
              @keyframes gradientMove {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>

            {/* Song Title */}
            <div className="text-white text-lg max-w-[250px] truncate text-center">
              {currentSong.name}
            </div>

            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              className="w-64"
            />

            {/* Audio */}
            {audioURL && (
              <audio
                ref={audioRef}
                src={audioURL}
                onTimeUpdate={handleTimeUpdate}
                onEnded={nextSong}
                onLoadedMetadata={handleLoadedMetadata}
              />
            )}

            {/* Controls */}
            <div className="flex gap-5 mt-4">
              <Button onClick={prevSong}>Prev</Button>
              <Button onClick={playPause}>{playing ? "Pause" : "Play"}</Button>
              <Button onClick={nextSong}>Next</Button>
            </div>
          </>
        ) : (
          <div className="text-white">Select a folder to load songs</div>
        )}
      </div>

      {/* Bottom */}
      <div className=" h-[12%] flex items-center justify-center text-white text-shadow-sm font-mono text-[12px] tracking-widest">
        Enjoy music without aids
      </div>

      {/* Playlist */}
      <Modal
        title="Playlist"
        open={playlistVisible}
        onCancel={() => setPlaylistVisible(false)}
        footer={null}
      >
        <div className="h-[600px] overflow-y-scroll">
          <List
            dataSource={songs}
            renderItem={(song, index) => (
              <List.Item>
                <Button
                  type="link"
                  onClick={() => playSong(index)}
                  className="max-w-[250px] truncate"
                >
                  {song.name}
                </Button>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </div>
  );
}