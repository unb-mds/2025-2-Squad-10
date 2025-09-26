
import TabelaInfo from './components/TabelaInfo'; 
import './App.css';
import './index.css'; 
function App() {
  return (
    <div className="App">
      <main className="App-content">
        {}
        <div className="mapa-placeholder">
          <p>Área do Mapa</p>
        </div>

       {}
        <TabelaInfo />
        
      </main>
    </div>
  );
}

export default App;