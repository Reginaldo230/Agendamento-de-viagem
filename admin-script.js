import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, getDocs, updateDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  // sua configuração do Firebase aqui
        apiKey: "AIzaSyB1qtc7zlp6adNE1Szld1qg-oq9Beclh6g",
        authDomain: "viagens-6fdb5.firebaseapp.com",
        projectId: "viagens-6fdb5",
        storageBucket: "viagens-6fdb5.appspot.com",
        messagingSenderId: "145031200508",
        appId: "1:145031200508:web:a77f3a415cfaf60aef2179"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadTrips() {
    const q = query(collection(db, "viagens"));
    const querySnapshot = await getDocs(q);

    const tripsList = document.getElementById('trips-list');
    tripsList.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const trip = doc.data();
        const tripItem = document.createElement('div');
        tripItem.classList.add('list-group-item', 'list-group-item-action');

        tripItem.innerHTML = `
            <h5>${trip.destino}</h5>
            <p><b>ID: </b>${doc.id}</p>
            <p><b>Usuário: </b>${trip.email}</p>
            <p><b>Ponto de Partida: </b>${trip.origem}</p>
            <p><b>Destino: </b>${trip.destino}</p>
            <p><b>Data: </b>${trip.data}</p>
            <p><b>Número de Pessoas: </b>${trip.numPessoas}</p>
            <p><b>Email: </b>${trip.email}</p>
            <p><b>Telefone: </b>${trip.telefone}</p>
            <p><b>Data de Envio: </b>${trip.dataEnvio.toDate().toLocaleString()}</p>
            <p><b>Preço: </b>${trip.preco} Kz</p>
            <p><b>Status: </b>${trip.status}</p>
            ${trip.dataChegada ? `<p><b>Data de Chegada: </b>${trip.dataChegada.toDate().toLocaleString()}</p>` : ''}
            ${trip.status === 'pendente' ? `
            <button class="btn btn-success" onclick="updateTripStatus('${doc.id}', 'accepted')">Aceitar</button>
            <button class="btn btn-danger" onclick="updateTripStatus('${doc.id}', 'denied')">Negar</button>
            ` : ''}
        `;
        tripsList.appendChild(tripItem);
    });
}

async function updateTripStatus(id, status) {
    try {
        const tripRef = doc(db, "viagens", id);
        const updateData = {
            status
        };

        if (status === 'accepted') {
            updateData.dataChegada = Timestamp.fromDate(new Date());
        }

        await updateDoc(tripRef, updateData);
        Swal.fire('Atualizado!', 'O status da viagem foi atualizado.', 'success');
        loadTrips();
    } catch (error) {
        console.error('Erro ao atualizar status: ', error);
        Swal.fire('Erro', 'Erro ao atualizar status da viagem.', 'error');
    }
}

window.updateTripStatus = updateTripStatus;
window.loadTrips = loadTrips;

loadTrips();
