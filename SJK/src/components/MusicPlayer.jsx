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
  const [gradientSpeed, setGradientSpeed] = useState(10);

  const audioRef = useRef(null);
  const [folderHandle, setFolderHandle] = useState(null);

  // Try to restore last folder on mount
  useEffect(() => {
    const lastFolder = localStorage.getItem("folderHandle");
    if (lastFolder) {
      // Just flag; user needs to re-grant permission
      setFolderHandle(true);
    }
  }, []);

  const openFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setFolderHandle(handle);
      localStorage.setItem("folderHandle", true); // flag to restore next time
      loadSongsFromFolder(handle);
    } catch (e) {
      console.log("Folder selection cancelled");
    }
  };

  const loadSongsFromFolder = async (handle) => {
    const files = [];
    for await (const entry of handle.values()) {
      if (entry.kind === "file" && entry.name.toLowerCase().endsWith(".mp3")) {
        files.push(entry);
      }
    }
    setSongs(files);
    setCurrentIndex(null);
    setPlaying(false);
    setProgress(0);
  };

  const playSong = async (index) => {
    setCurrentIndex(index);
    setPlaying(true);
    setPlaylistVisible(false);

    if (!songs[index]) return;
    const file = await songs[index].getFile();
    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    }
    setProgress(0);
    setDuration(0);
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

  // Gradient animation linked to music
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
      setGradientSpeed(5 + avg / 30);
      requestAnimationFrame(tick);
    };
    tick();
  }, []);

  return (
    <div className="bg-black h-screen p-5 flex flex-col gap-3">
      {/* Top */}
      <div className="h-[8%] flex justify-between px-5 items-center">
        <div>
          <Button size="large" type="primary" onClick={openFolder}>
            Open Folder
          </Button>
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
      <div className="h-[80%] flex flex-col justify-center items-center gap-5 w-full">
        {songs.length === 0 ? (
          <div className="text-white text-center">
            <p>No folder selected.</p>
            <Button type="primary" onClick={openFolder}>
              Click here to select or restore folder
            </Button>
          </div>
        ) : currentSong ? (
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
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={nextSong}
              onLoadedMetadata={handleLoadedMetadata}
            />

            {/* Controls */}
            <div className="flex gap-5 mt-4">
              <Button onClick={prevSong}>Prev</Button>
              <Button onClick={playPause}>{playing ? "Pause" : "Play"}</Button>
              <Button onClick={nextSong}>Next</Button>
            </div>
          </>
        ) : (
          <div className="text-white">Select a song to play</div>
        )}
      </div>

      {/* Bottom */}
      <div className="h-[12%] flex items-center justify-center text-white text-shadow-sm font-mono text-[12px] tracking-widest">
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