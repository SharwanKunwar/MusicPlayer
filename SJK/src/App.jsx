import Container from "./components/Container";
import MusicPlayer from "./components/MusicPlayer";

function App() {
  return (
    <div className="w-screen bg-yellow-400 flex justify-center">
      <Container>
      <MusicPlayer />

      </Container>
    </div>
  );
}

export default App;