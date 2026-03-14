import React, { useState, useRef } from "react";

export default function MusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showList, setShowList] = useState(true);

  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Open folder picker
  const openFolder = () => inputRef.current.click();

  // Handle folder selection
  const handleFolder = (e) => {
    const files = Array.from(e.target.files);
    const mp3Files = files.filter(file => file.name.endsWith(".mp3"));
    setSongs(mp3Files);
    setCurrentIndex(0);
    setPlaying(false);
  };

  // Play song
  const playSong = (index) => {
    setCurrentIndex(index);
    setPlaying(true);
    setTimeout(() => audioRef.current.play(), 0);
  };

  // Play / Pause toggle
  const playPause = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  // Next / Previous
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
    <div className="p-5 bg-red-400 min-h-screen">

      <h1 className="text-2xl font-bold mb-4">🎵 Music Player</h1>

      {/* Hidden folder input */}
      <input
        ref={inputRef}
        type="file"
        webkitdirectory
        multiple
        accept=".mp3"
        style={{ display: "none" }}
        onChange={handleFolder}
      />

      {/* Buttons */}
      <div className="flex gap-4 mb-4">
        <button onClick={openFolder} className="bg-black text-white px-4 py-2 rounded">
          Add Folder
        </button>

        <button
          onClick={() => setShowList(!showList)}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          {showList ? "Hide Playlist" : "Show Playlist"}
        </button>
      </div>

      {/* Player */}
      {currentSong && (
        <div className="mb-4">
          <p className="font-semibold mb-2">Now Playing: {currentSong.name}</p>
          <audio ref={audioRef} src={URL.createObjectURL(currentSong)} onEnded={nextSong} />
          <div className="flex gap-4 mt-2">
            <button onClick={prevSong} className="px-3 py-1 bg-gray-700 text-white rounded">Prev</button>
            <button onClick={playPause} className="px-3 py-1 bg-gray-700 text-white rounded">
              {playing ? "Pause" : "Play"}
            </button>
            <button onClick={nextSong} className="px-3 py-1 bg-gray-700 text-white rounded">Next</button>
          </div>
        </div>
      )}

      {/* Playlist */}
      {showList && (
        <div className="bg-white p-3 rounded max-h-80 overflow-y-auto">
          <h3 className="font-bold mb-2">Playlist ({songs.length})</h3>
          {songs.map((song, index) => (
            <div key={index} className="mb-1">
              <button
                onClick={() => playSong(index)}
                className={`text-blue-600 hover:underline ${currentIndex === index ? "font-bold" : ""}`}
              >
                {song.name}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}