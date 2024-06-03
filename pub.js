import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1qtc7zlp6adNE1Szld1qg-oq9Beclh6g",
    authDomain: "viagens-6fdb5.firebaseapp.com",
    projectId: "viagens-6fdb5",
    storageBucket: "viagens-6fdb5.appspot.com",
    messagingSenderId: "145031200508",
    appId: "1:145031200508:web:a77f3a415cfaf60aef2179"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const user = { uid: "12345", nome: "Administrador" }; // Substitua por autenticação real

const createPost = async (postContent, fileURL, fileType) => {
    const newPost = {
        nome: user.nome,
        uid: user.uid,
        conteudo: postContent,
        timestamp: serverTimestamp(),
        likes: {} // Usando um Map vazio para armazenar os likes
    };

    if (fileURL && fileType) {
        newPost.arquivo = fileURL;
        newPost.tipoArquivo = fileType;
    }

    await addDoc(collection(db, "publicacoes"), newPost);
};

document.getElementById("btn-post").addEventListener("click", async () => {
    const postContent = document.getElementById("post-input").value.trim();
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    if (postContent === "" && !file) {
        Swal.fire('Erro', 'A publicação não pode estar vazia!', 'error');
        return;
    }

    try {
        if (file) {
            const storageRef = ref(storage, `${file.type.split('/')[0]}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await createPost(postContent, downloadURL, file.type.split('/')[0]);
        } else {
            await createPost(postContent);
        }

        document.getElementById("post-input").value = "";
        fileInput.value = ""; // Reseta o input de arquivo
    } catch (error) {
        console.error("Erro ao publicar: ", error);
        Swal.fire('Erro', 'Erro ao publicar', 'error');
    }
});

document.getElementById("btn-upload").addEventListener("click", () => {
    document.getElementById("file-input").click();
});

const toggleLike = async (postId, likes) => {
    const userId = user.uid;
    const postRef = doc(db, "publicacoes", postId);
    let updatedLikes = { ...likes }; // Cria uma cópia do Map de likes

    // Verifica se o usuário já deu like nesta publicação
    if (updatedLikes[userId]) {
        // Se o usuário já deu like, remove o like
        delete updatedLikes[userId];
    } else {
        // Se o usuário não deu like, adiciona o like
        updatedLikes[userId] = true;
    }

    // Atualiza a publicação com os likes atualizados
    await updateDoc(postRef, { likes: updatedLikes });
};

const displayPosts = (docs) => {
    const postList = document.getElementById("post-list");
    postList.innerHTML = '';
    docs.forEach((doc) => {
        const data = doc.data();
        const postId = doc.id;
        const date = data.timestamp ? data.timestamp.toDate() : new Date();
        const formattedDate = date.toLocaleString();
        const liked = data.likes[user.uid] ? 'fas' : 'far';

        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
            <div class="header">${data.nome}</div>
            <div class="timestamp">${formattedDate}</div>
            <div class="body">${data.conteudo ? `<p>${data.conteudo}</p>` : ''}</div>
            ${data.tipoArquivo === 'image' ? `<img src="${data.arquivo}" alt="Imagem publicada" class="img-fluid">` : ''}
            ${data.tipoArquivo === 'audio' ? `<audio controls><source src="${data.arquivo}" type="audio/mpeg">Seu navegador não suporta o elemento de áudio.</audio>` : ''}
            ${data.tipoArquivo === 'video' ? `<video controls class="img-fluid"><source src="${data.arquivo}" type="video/mp4">Seu navegador não suporta o elemento de vídeo.</video>` : ''}
            <div class="text-right">
                <i class="${liked} fa-heart like-button" data-id="${postId}"></i> ${Object.keys(data.likes).length}
            </div>
        `;
        postList.insertBefore(postElement, postList.firstChild); // Insere a publicação no topo da lista

        postElement.querySelector(".like-button").addEventListener("click", () => {
            toggleLike(postId, data.likes);
        });
    });
};

const q = query(collection(db, "publicacoes"), orderBy("timestamp", "desc"));
onSnapshot(q, (querySnapshot) => {
    displayPosts(querySnapshot.docs);
});
