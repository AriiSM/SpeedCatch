import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import useWebSocket from '../backend/useWebSocket';
import Sidebar from '../components/Sidebar';
import SearchArea from '../components/SearchArea';
import ResultsArea from '../components/ResultsArea';
import DocumentsList from '../components/DocumentsList';
import { barChartOutline, boatSharp, pieChartOutline, pieChartSharp, statsChart, statsChartOutline, statsChartSharp } from 'ionicons/icons';
import { useDisplayContext } from '../components/DisplayContext';
import { AntonymDoc } from '../components/AntonymDoc';
import AntoSearch from '../components/AntoSearch';
Chart.register(...registerables);

interface NotebookProps {
  onLogout: () => void;
}

const Notebook: React.FC<NotebookProps> = ({ onLogout }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [randomTitles, setRandomTitles] = useState<string[]>([]);
  const [showSearchResultsAnto, setShowSearchResultsAnto] = useState(true);


  const { sendMessage, documents, loading, searchResponse, topDocumentTitle, totalDocuments, searchAntoResult } = useWebSocket('ws://localhost:8000/ws');
  const { showAntonymDoc } = useDisplayContext();

  const handleSearch = () => {
    setSearchedText(searchText);
    sendMessage({ type: 'SEARCH', payload: searchText });
    setSearchText('');
    setShowSearchResults(true);
  };

  const handleSearchAnto = () => {
    setSearchedText(searchText);
    sendMessage({ type: 'SEARCH_ANTONIM', payload: { query: searchText } });
    setSearchText('');
    setShowSearchResultsAnto(true);
  };

  const handleDocumentClick = (content: string) => {
    // Logic for document click
  };

  const history = useHistory();

  const handleLogoutClick = () => {
    onLogout();
    history.push('/login');
  };

  const sortedDocuments = [...documents].sort((a, b) => b.similarity - a.similarity);

  const similarityData = sortedDocuments.map(doc => doc.similarity);
  const labels = sortedDocuments.map((doc, index) => `Doc ${index + 1}`);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Similarities',
        data: similarityData,
        backgroundColor: '#DA932B',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
        barThickness: 30,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function (value) {
            return value * 100 + '%';
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += (context.parsed.y * 100).toFixed(2) + '%';
            }
            return label;
          },
        },
      },
    },
  };

  useEffect(() => {
    if (documents.length > 0) {
      const shuffled = [...documents].sort(() => 0.5 - Math.random());
      setRandomTitles(shuffled.slice(0, 3).map(doc => doc.title));
    }
  }, [documents]);

  return (
    <IonPage style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      <IonContent style={{ height: '100%', backgroundColor: '#f5f5f5' }}>
        <IonGrid style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', height: '100%' }}>
          <IonRow style={{ backgroundColor: '#f5f5f5' }}>
            <Sidebar onLogout={handleLogoutClick} onSearchToggle={() => setShowSearchResults((prev) => !prev)} />
            <IonGrid style={{ backgroundColor: '#f5f5f5', marginLeft: '100px', borderRadius: '8px' }}>
              {showSearchResults && (
                <div className="animated-section">
                  <ResultsArea
                    searchedText={searchedText}
                    loading={loading}
                    searchResponse={searchResponse}
                    topDocumentTitle={topDocumentTitle}
                    antonymResult={null}
                  />
                  <SearchArea searchText={searchText} setSearchText={setSearchText} onSearch={handleSearch} />
                </div>
              )}
              {showAntonymDoc ? (
                <>
                  {showSearchResultsAnto && (
                    <div className="animated-section">
                       <ResultsArea
                        searchedText={searchedText}
                        loading={loading}
                        searchResponse={null} // Poți seta null dacă folosești doar antonyme
                        topDocumentTitle={null} // La fel, null dacă nu e relevant aici
                        antonymResult={searchAntoResult} // Transmite rezultatul pentru antonime
                      />
                      <AntoSearch searchText={searchText} setSearchText={setSearchText} onSearch={handleSearchAnto} />
                    </div>
                  )}
                  <AntonymDoc initialTitle="" initialContent="" />
                </>
              ) : (
                <DocumentsList documents={documents} onDocumentClick={handleDocumentClick} />
              )}
            </IonGrid>
            <IonCol
              size="3"
              style={{
                backgroundColor: '#f5f5f5',
                marginLeft: '25px',
                marginRight: '30px',
                marginTop: '25px',
                borderRadius: '8px',
              }}
            >
              <IonRow
                className="hoverable-row"
                style={{
                  backgroundColor: '#f3eacf',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  height: '300px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {showAntonymDoc ? ( //DANA
                  <>
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h5
                    style={{
                      color: '#5d4037',
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                    }}
                    >Antonym Analysis</h5>
                  </div>
                  {documents.length > 0 ? (
                    <div  style={{ width: '80%', height: '78%', marginLeft: '17%' }}>
                      {/* Afișăm Pie Chart în locul Bar Chart */}
                      <Pie
                        data={{
                          labels: ['Contradiction', 'Entailment', 'Neutral'],
                          datasets: [
                            {
                              label: 'Antonym Analysis',
                              data: [50, 13, 37], // Valorile cadranelor
                              backgroundColor: ['#E57373', '#A5C76F', '#FFD54F'], // Culori în temă cu aplicația
                              borderColor: '#ffffff', // Folosim alb pentru marginile segmentelor pentru un contrast clar
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          plugins: {
                            legend: {
                              labels: {
                                color: '#5d4037', // Culoare maro cald pentru label-uri
                                font: {
                                  size:11, // Dimensiunea fontului
                                  family: 'Arial, sans-serif', // Font tematic
                                },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  // Stilizarea etichetei din tooltip
                                  let label = context.dataset.label || '';
                                  if (label) {
                                    label = `🔍 ${label}`; // Adăugăm un simbol înainte de etichetă
                                  }
                                  if (context.raw !== null) {
                                    label += `: ${context.raw}%`; // Adăugăm valoarea în procente
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <IonIcon
                        icon={statsChartSharp}
                        style={{
                          marginLeft: '30px',
                          fontSize: '100px',
                          color: '#DA932B',
                          strokeWidth: '1',
                          marginTop: '10px',
                        }}
                      ></IonIcon>
                      <h5 style={{ marginLeft: '20px' }}>Retry</h5>
                      <p style={{ textAlign: 'center', color: '#666', marginLeft: '20px' }}>
                        Incearca cu alt query
                      </p>
                    </>
                  )}
                </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                      <h5>Total Documents: {totalDocuments}</h5>
                    </div>
                    {documents.length > 0 ? (
                      <div style={{ width: '100%', height: '65%' }}>
                        <Bar data={data} options={options} />
                      </div>
                    ) : (
                      <>
                        <IonIcon
                          icon={statsChartSharp}
                          style={{
                            marginLeft: '30px',
                            fontSize: '100px',
                            color: '#DA932B',
                            strokeWidth: '1',
                            marginTop: '10px',
                          }}
                        ></IonIcon>
                        <h5 style={{ marginLeft: '20px' }}>Retry</h5>
                        <p style={{ textAlign: 'center', color: '#666', marginLeft: '20px' }}>
                          Incearca cu alt query
                        </p>
                      </>
                    )}
                  </>
                )}
              </IonRow>

              <IonRow
                className="hoverable-row"
                style={{
                  backgroundColor: '#f3eacf',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  height: '150px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IonIcon icon={pieChartSharp} style={{ fontSize: '50px', color: '#DA932B', marginBottom: '10px' }} />
                <h5 style={{ textAlign: 'center', color: '#5d4037' }}>Recent Searches</h5>
                <p style={{ textAlign: 'center', color: '#666', margin: '0 20px' }}>
                  Explore the most recent searches and their results.
                </p>
              </IonRow>

              <IonRow
                className="hoverable-row"
                style={{
                  backgroundColor: '#f3eacf',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  padding: '15px',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <h5
                  style={{
                    color: '#5d4037',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    fontFamily: 'Arial, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  Random Document Titles
                </h5>
                {randomTitles.length > 0 ? (
                  <ul
                    style={{
                      listStyleType: 'none',
                      padding: 0,
                      margin: 0,
                      width: '100%',
                    }}
                  >
                    {randomTitles.map((title, index) => (
                      <li
                        key={index}
                        style={{
                          backgroundColor: '#e2d8b6',
                          padding: '10px',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          fontSize: '14px',
                          color: '#5d4037',
                          fontFamily: 'Arial, sans-serif',
                          textAlign: 'center',
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#d1c29f';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#e2d8b6';
                        }}
                      >
                        <strong>{title}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#888', fontSize: '14px', textAlign: 'center' }}>
                    No documents found.
                  </p>
                )}
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Notebook;