import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, getDocs, addDoc, deleteDoc, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);

let currentUser = null;

function showHome() {
    document.getElementById('homeContent').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('userTrips').style.display = 'none';
}

function showBookingForm() {
    document.getElementById('homeContent').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('userTrips').style.display = 'none';
}

function showUserTrips() {
    document.getElementById('homeContent').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('userTrips').style.display = 'block';
    loadUserTrips();
}

function showAbout() {
    $('#aboutModal').modal('show');
}

async function loadUserTrips() {
    if (!currentUser) return;

    const q = query(collection(db, "viagens"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    const tripsList = document.getElementById('user-trips-list');
    tripsList.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const trip = doc.data();
        const tripItem = document.createElement('div');
        tripItem.classList.add('list-group-item', 'list-group-item-action');
        tripItem.style.backgroundColor = trip.status === 'accepted' ? 'green' : (trip.status === 'denied' ? 'red' : '');

        tripItem.innerHTML = `
            <h5>${trip.destino}</h5>
            <p>ID: ${doc.id}</p>
            <p>Origem: ${trip.origem}</p>
            <p>Data: ${trip.data}</p>
            <p>Número de Pessoas: ${trip.numPessoas}</p>
            <p>Email: ${trip.email}</p>
            <p>Telefone: ${trip.telefone}</p>
            <p>Data de Envio: ${trip.dataEnvio.toDate().toLocaleDateString()}</p>
            <p>Preço: ${trip.preco} Kz</p>
            <p>Status: ${trip.status}</p>
            <button class="btn btn-danger" onclick="deleteTrip('${doc.id}')">Apagar</button>
        `;
        tripsList.appendChild(tripItem);
    });
}

async function deleteTrip(id) {
    try {
        await deleteDoc(collection(db, "viagens").doc(id));
        Swal.fire('Deletado!', 'A viagem foi deletada.', 'success');
        loadUserTrips();
    } catch (error) {
        console.error('Erro ao deletar viagem: ', error);
        Swal.fire('Erro', 'Erro ao deletar viagem.', 'error');
    }
}

function updatePrice() {
    const destination = document.getElementById('destination').value;
    const numPeople = document.getElementById('numPeople').value;

    const prices = {
        "Bengo": 1000,
        "Benguela": 1500,
        "Bié": 2000,
        "Cabinda": 2500,
        "Cuando Cubango": 3000,
        "Cuanza Norte": 1000,
        "Cuanza Sul": 1500,
        "Cunene": 2000,
        "Huambo": 2500,
        "Huíla": 3000,
        "Luanda": 500,
        "Lunda Norte": 3500,
        "Lunda Sul": 4000,
        "Malanje": 1500,
        "Moxico": 4500,
        "Namibe": 5000,
        "Uíge": 1000,
        "Zaire": 1500
    };

    const price = prices[destination] * numPeople;
    document.getElementById('price').value = price;
}

document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const destino = document.getElementById('destination').value;
    const origem = document.getElementById('origin').value;
    const numPessoas = document.getElementById('numPeople').value;
    const data = document.getElementById('tripDate').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('phoneNumber').value;
    const preco = document.getElementById('price').value;

    Swal.fire({
        title: 'Confirmar Agendamento',
        html: `
            <p><strong>Destino:</strong> ${destino}</p>
            <p><strong>Origem:</strong> ${origem}</p>
            <p><strong>Número de Pessoas:</strong> ${numPessoas}</p>
            <p><strong>Data:</strong> ${data}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone}</p>
            <p><strong>Preço:</strong> ${preco} Kz</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sim, Agendar',
        cancelButtonText: 'Não'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await addDoc(collection(db, "viagens"), {
                    userId: currentUser.uid,
                    destino,
                    origem,
                    numPessoas,
                    data,
                    email,
                    telefone,
                    preco,
                    status: 'pendente',
                    dataEnvio: serverTimestamp()
                });
                Swal.fire('Agendado!', 'Sua viagem foi agendada com sucesso.', 'success');
                showUserTrips();
            } catch (error) {
                console.error('Erro ao agendar viagem: ', error);
                Swal.fire('Erro', 'Erro ao agendar viagem.', 'error');
            }
        }
    });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-name').textContent = user.email;
        showHome();
    } else {
        window.location.href = 'login.html';
    }
});

// Make functions available globally
window.showBookingForm = showBookingForm;
window.showUserTrips = showUserTrips;
window.deleteTrip = deleteTrip;
window.updatePrice = updatePrice;
