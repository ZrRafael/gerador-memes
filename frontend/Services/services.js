import { db } from '../../backend/firebase-config.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    getDoc,
    query,
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const MemeService = {
    async getAllMemes() {
        try {
            const memesCol = collection(db, 'memes');
            const q = query(memesCol, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            
            const memes = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Documento do Firestore:', {
                    docId: doc.id,
                    data: data
                });
                return {
                    docId: doc.id,  // ID do documento do Firestore
                    ...data
                };
            });
            
            console.log('Todos os memes:', memes);
            return memes;
        } catch (error) {
            console.error('Error fetching memes:', error);
            throw error;
        }
    },

    async saveMeme(memeData) {
        try {
            const docRef = await addDoc(collection(db, "memes"), memeData);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error saving meme: ", error);
            return { success: false, error };
        }
    },

    async deleteMeme(docId) {
        try {
            console.log('Tentando deletar documento com ID:', docId);
            
            if (!docId) {
                throw new Error('ID do documento não fornecido');
            }

            // Verificar se o documento existe
            const docRef = doc(db, 'memes', docId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.error('Documento não encontrado:', docId);
                throw new Error('Meme não encontrado');
            }

            await deleteDoc(docRef);

            console.log('Documento deletado com sucesso:', docId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting meme:', error);
            throw error;
        }
    },

    async getMeme(docId) {
        try {
            if (!docId) {
                throw new Error('ID do documento não fornecido');
            }

            const docRef = doc(db, 'memes', docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    docId: docSnap.id,
                    ...data
                };
            } else {
                throw new Error('Meme não encontrado');
            }
        } catch (error) {
            console.error('Error fetching meme:', error);
            throw error;
        }
    },

    async checkMemeNameExists(name) {
        try {
            const q = query(collection(db, "memes"), where("title", "==", name));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking meme name: ", error);
            throw error;
        }
    }
};

export default MemeService; 