import { useEffect, useRef, useState } from 'react';
import { NoteProps } from "./utils";

export interface MessageProps {
  type: string;
  payload?: any;
}

const useWebSocket = (url: string) => {
  const socket = useRef<WebSocket>();
  const [response, setResponse] = useState<MessageProps>();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<NoteProps[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [searchResponse, setSearchResponse] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [topDocumentTitle, setTopDocumentTitle] = useState<string | null>(null);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [searchAntoResult, setSearchAntoResult] = useState<string | null>(null); // Stare pentru răspunsul primit


  useEffect(() => {
    console.log('Received response:', response);
  
    if (response?.type === 'UPLOAD_FILE') {
      console.log('UPLOAD_FILE response:', response.payload);
      if (response.payload === "File processed successfully") {
        window.location.reload();
      }
    }
  }, [response]);






  useEffect(() => {
    console.log('Received response:', response);
  
    if (response?.type === 'INIT') {
      console.log('Connection established');
      const docs = response.payload.map((title: string, index: number) => ({
        id: (index + 1).toString(),  // Ajustează indexarea pentru a începe de la 1
        title,
        content: '' // Adaugă conținutul documentului dacă este disponibil
      }));
      setDocuments(docs);
      setTotalDocuments(response.payload.length); // Setează numărul total de documente


    } else if (response?.type === 'SEARCH') {
      // Procesăm răspunsul de căutare
      const docs = response.payload.documents.map((doc: { similarity: number, title: string, text: string }, index: number) => ({
        id: (index + 1).toString(),  // Ajustează indexarea pentru a începe de la 1
        title: doc.title,         // Folosește `title` în loc de `file`
        similarity: doc.similarity, // Similaritatea
        text: doc.text      // Propoziția
      }));
      console.log('Search results len:', docs.length); 
      setDocuments(docs);
      setSearchResponse(response.payload.query);
      if (docs.length > 0) {
        setTopDocumentTitle(docs[0].title);
      }


    } else if (response?.type === 'CONTENT') {
      console.log('Content len:', response.payload.content.length);
      setContent(response.payload.content.join(' '));


    } else if (response?.type === 'SEARCH_FILTER') {
      const docs = response.payload.documents.map((doc: { title: string, text: string }, index: number) => ({
        id: (index + 1).toString(),
        title: doc.title,
        text: doc.text
      }));

      console.log('SEARCH_FILTER response:', docs);
      setDocuments(docs);
      setSearchResponse(response.payload.query);
    
    
    } else if (response?.type === "SEARCH_ANTONIM") {
      console.log("SEARCH_ANTONIM response received:", response.payload);
      setSearchAntoResult(response.payload.result); // Setează `antonymResult`
      console.log("Updated antonymResult:", response.payload.result);
    }
  


  }, [response]);
  







  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      sendMessage({ type: "INIT", payload: "" });
    };


    socket.current.onmessage = (event) => {
      console.log('Got message from server:', event.data);
      setResponse(JSON.parse(event.data) as MessageProps);
      setLoading(false);
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      socket.current?.close();
    };
  }, [url]);







  const sendMessage = (message: MessageProps) => {
    console.log('Sending message:', message);  // Adaugă log pentru mesajul trimis
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
      setLoading(true);
    } else {
      console.error('WebSocket is not open');
    }
  };

  return { sendMessage, documents, loading, searchResponse, isConnected, content, topDocumentTitle, totalDocuments, searchAntoResult };
};

export default useWebSocket;