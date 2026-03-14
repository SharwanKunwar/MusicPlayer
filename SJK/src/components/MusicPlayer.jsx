import React, { useState, useRef } from "react";

export default function MusicPlayer() {

  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [showList, setShowList] = useState(true);

  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // open folder picker
  const openFolder = () => {
    inputRef.current.click();
  };

  // read folder files
  const handleFolder = (e) => {

    const files = Array.from(e.target.files);

    const mp3Files = files.filter(file =>
      file.name.toLowerCase().endsWith(".mp3")
    );

    console.log(mp3Files);

    setSongs(mp3Files);
    setCurrentIndex(null);
    setPlaying(false);
  };

  // play song
  const playSong = (index) => {

    setCurrentIndex(index);
    setPlaying(true);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 0);
  };

  // play / pause
  const playPause = () => {

    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  // next song
  const nextSong = () => {

    if (songs.length === 0) return;

    const next = (currentIndex + 1) % songs.length;
    playSong(next);
  };

  // previous song
  const prevSong = () => {

    if (songs.length === 0) return;

    const prev = (currentIndex - 1 + songs.length) % songs.length;
    playSong(prev);
  };

  const currentSong = songs[currentIndex];

  return (

    <div className="p-6 bg-gray-900 text-white min-h-screen">

      <h1 className="text-2xl font-bold mb-4">🎵 React Music Player</h1>

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

      {/* buttons */}
      <div className="flex gap-4 mb-6">

        <button
          onClick={openFolder}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Add Folder
        </button>

        <button
          onClick={() => setShowList(!showList)}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          {showList ? "Hide Playlist" : "Show Playlist"}
        </button>

      </div>

      {/* player */}
      {currentSong && (

        <div className="mb-6">

          <p className="mb-2 font-semibold">
            Now Playing: {currentSong.name}
          </p>

          <audio
            ref={audioRef}
            src={URL.createObjectURL(currentSong)}
            onEnded={nextSong}
          />

          <div className="flex gap-4 mt-2">

            <button
              onClick={prevSong}
              className="bg-gray-700 px-3 py-1 rounded"
            >
              Prev
            </button>

            <button
              onClick={playPause}
              className="bg-green-600 px-3 py-1 rounded"
            >
              {playing ? "Pause" : "Play"}
            </button>

            <button
              onClick={nextSong}
              className="bg-gray-700 px-3 py-1 rounded"
            >
              Next
            </button>

          </div>

        </div>
      )}

      {/* playlist */}
      {showList && (

        <div className="bg-white text-black p-4 rounded max-h-80 overflow-y-auto">

          <h3 className="font-bold mb-3">
            Playlist ({songs.length})
          </h3>

          {songs.map((song, index) => (

            <div key={index} className="mb-1">

              <button
                onClick={() => playSong(index)}
                className={`hover:underline ${
                  currentIndex === index ? "font-bold text-blue-600" : ""
                }`}
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