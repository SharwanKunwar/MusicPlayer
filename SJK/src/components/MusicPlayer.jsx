import React, { useState, useRef } from "react";

export default function MusicPlayer() {

  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const openFolder = () => {
    inputRef.current.click();
  };

  const handleFolder = (e) => {
    const files = Array.from(e.target.files);

    const mp3Files = files.filter(file =>
      file.name.toLowerCase().endsWith(".mp3")
    );

    setSongs(mp3Files);
    setCurrentIndex(null);
    setPlaying(false);
  };

  const playSong = (index) => {
    setCurrentIndex(index);
    setPlaying(true);

    setTimeout(() => {
      if (audioRef.current) audioRef.current.play();
    }, 0);
  };

  const playPause = () => {

    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

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

  const currentSong = songs[currentIndex];

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b0147] to-black text-white">

      {/* hidden folder input */}
      <input
        ref={inputRef}
        type="file"
        webkitdirectory="true"
        multiple
        accept=".mp3"
        style={{ display: "none" }}
        onChange={handleFolder}
      />

      <div className="w-[360px] p-6 rounded-3xl bg-[#1a022e] shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center text-gray-400 mb-6">
          <button onClick={openFolder}>📁</button>
          <p className="tracking-widest text-sm">NOW PLAYING</p>
          <span>⋮</span>
        </div>

        {/* Album */}
        <div className="bg-gray-200 rounded-2xl p-6 flex justify-center mb-6 shadow-lg">
          <img
            src="https://picsum.photos/300"
            className="w-48 h-48 object-cover shadow-xl"
          />
        </div>

        {/* Song Info */}
        {currentSong && (
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold truncate">
              {currentSong.name}
            </h2>
            <p className="text-purple-400 text-sm">
              Local Music
            </p>
          </div>
        )}

        {/* Audio */}
        {currentSong && (
          <audio
            ref={audioRef}
            src={URL.createObjectURL(currentSong)}
            onEnded={nextSong}
          />
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mb-6 text-gray-300">

          <button>🔀</button>

          <button onClick={prevSong}>⏮</button>

          <button
            onClick={playPause}
            className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/40"
          >
            {playing ? "⏸" : "▶"}
          </button>

          <button onClick={nextSong}>⏭</button>

          <button>🔁</button>

        </div>

        {/* Playlist */}
        <div className="max-h-40 overflow-y-auto text-sm">

          {songs.map((song, index) => (

            <div key={index}>

              <button
                onClick={() => playSong(index)}
                className={`w-full text-left px-3 py-2 rounded ${
                  currentIndex === index
                    ? "bg-purple-700"
                    : "hover:bg-white/10"
                }`}
              >
                {song.name}
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}