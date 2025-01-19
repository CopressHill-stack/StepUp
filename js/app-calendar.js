document.addEventListener('DOMContentLoaded', () => {


// Ініціалізація дощок з локального збереження
let boards;
try {
    boards = JSON.parse(localStorage.getItem("boards")) || [];
} catch (error) {
    console.error("Помилка при парсингу даних з localStorage:", error);
    boards = [];
}
let selectedBoardIndex = null;

// Оновлення випадаючого списку дощок
function updateBoardSelector() {
    const boardSelector = document.getElementById("boardSelector");
    boardSelector.innerHTML = "";

    if (boards.length > 0) {
        boards.forEach((board, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = board.name;
            boardSelector.appendChild(option);
        });

        // Якщо є вибрана дошка, встановлюємо її як активну
        if (selectedBoardIndex !== null && selectedBoardIndex < boards.length) {
            boardSelector.value = selectedBoardIndex;
        } else {
            // Якщо вибраної дошки немає, вибираємо першу
            selectedBoardIndex = 0;
            boardSelector.value = 0;
        }
    } else {
        // Якщо немає дощок, додаємо пункт "Оберіть дошку"
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = "Оберіть дошку";
        boardSelector.appendChild(defaultOption);

        selectedBoardIndex = null; // Очищуємо вибір
    }

    renderBoards(); // Оновлюємо вміст дошки
}

// Додавання нової дошки
document.getElementById("addBoardButton").addEventListener("click", () => {
    const boardName = prompt("Введіть назву дошки:");
    if (boardName) {
        boards.push({ name: boardName, cards: [] });
        saveBoards();
        updateBoardSelector();
        selectedBoardIndex = boards.length - 1; // Вибираємо новостворену дошку
        document.getElementById("boardSelector").value = selectedBoardIndex; // Оновлюємо вибраний елемент у випадаючому списку
        renderBoards();
    }
});


// Видалення дошки
document.getElementById("deleteBoardButton").addEventListener("click", () => {
    if (selectedBoardIndex !== null) {
        const confirmation = confirm("Ви впевнені, що хочете видалити цю дошку?");
        if (confirmation) {
            boards.splice(selectedBoardIndex, 1);
            selectedBoardIndex = null;
            saveBoards();
            updateBoardSelector();
            renderBoards();
        }
    } else {
        alert("Оберіть дошку для видалення.");
    }
});

// Додавання нової картки у дошку
function addCardToBoard() {
    const cardName = prompt("Введіть назву картки:");
    if (cardName && selectedBoardIndex !== null) {
        const cardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        boards[selectedBoardIndex].cards.push({ id: cardId, name: cardName, goals: [] });
        saveBoards();
        renderBoards();
    }
}

// Видалення картки
function deleteCard(cardIndex) {
    boards[selectedBoardIndex].cards.splice(cardIndex, 1);
    saveBoards();
    renderBoards();
}

// Збереження дощок у localStorage
function saveBoards() {
    localStorage.setItem("boards", JSON.stringify(boards));
}

// Додавання цілі в картку
function addGoalToCard(cardIndex) {
    const goalText = prompt("Введіть вашу ціль:");
    if (goalText) {
        boards[selectedBoardIndex].cards[cardIndex].goals.push(goalText);
        saveBoards();
        renderBoards();
    }
}

function setupDragAndDrop() {
    const goals = document.querySelectorAll(".goal");
    const cards = document.querySelectorAll(".card");
    // Додаємо події для цілей (draggable)
    goals.forEach((goal) => {
        console.log(goal);
        goal.draggable = true;
        goal.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("goalIndex", e.target.dataset.goalIndex);
            e.dataTransfer.setData("fromCardIndex", e.target.dataset.cardIndex);

            console.log(
                "Drag Start - Goal Index:",
                goal.dataset.goalIndex,
                "From Card Index:",
                goal.dataset.cardIndex
            );
        });
    });

    // Додаємо події для карток (drop zone)
    cards.forEach((card) => {
        card.addEventListener("dragover", (e) => {
            e.preventDefault(); // Дозволяємо перетягування
        });

        card.addEventListener("drop", (e) => {
            e.preventDefault();

            const goalIndex = e.dataTransfer.getData("goalIndex");
            const fromCardIndex = e.dataTransfer.getData("fromCardIndex");
            const toCardIndex = card.dataset.cardIndex;

            console.log(
                "Drop - Goal Index:",
                goalIndex,
                "From Card Index:",
                fromCardIndex,
                "To Card Index:",
                toCardIndex
            );

            // Переміщення цілі
            if (fromCardIndex !== toCardIndex) {
                const goal = boards[selectedBoardIndex].cards[fromCardIndex].goals.splice(
                    goalIndex,
                    1
                )[0];

                boards[selectedBoardIndex].cards[toCardIndex].goals.push(goal);
                saveBoards();
                renderBoards();
            }
        });
    });
}

// Рендеринг карток із цілями
function renderCards(boardDiv) {
    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("cards-container");
    cardsContainer.style.display = "grid";
    cardsContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    cardsContainer.style.gridAutoRows = "max-content";
    cardsContainer.style.gap = "1rem";

    boards[selectedBoardIndex].cards.forEach((card, cardIndex) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.dataset.cardIndex = cardIndex;

        // Назва картки
        const cardTitle = document.createElement("h4");
        cardTitle.textContent = card.name;
        cardDiv.appendChild(cardTitle);

        // Кнопка видалення картки
        const deleteCardButton = document.createElement("button");
        deleteCardButton.textContent = "Х";
        deleteCardButton.classList.add("delete-card");
        deleteCardButton.addEventListener("click", () => deleteCard(cardIndex));
        cardDiv.appendChild(deleteCardButton);

        // Цілі в картці
        card.goals.forEach((goal, goalIndex) => {
            const goalDiv = document.createElement("div");
            goalDiv.classList.add("goal");
            goalDiv.dataset.goalIndex = goalIndex;
            goalDiv.dataset.cardIndex = cardIndex;

            const goalText = document.createElement("span");
            goalText.textContent = goal;

            goalDiv.appendChild(goalText);
            cardDiv.appendChild(goalDiv);
        });

        // Кнопка додавання цілі
        const addGoalButton = document.createElement("button");
        addGoalButton.textContent = "Додати ціль";
        addGoalButton.classList.add("add-goal");
        addGoalButton.addEventListener("click", () => addGoalToCard(cardIndex));

        cardDiv.appendChild(addGoalButton);
        cardsContainer.appendChild(cardDiv);
    });

    boardDiv.appendChild(cardsContainer);
    setupDragAndDrop();
}

// Рендеринг дощок і карток
function renderBoards() {
    const container = document.getElementById("boardsContainer");
    container.innerHTML = "";

    if (selectedBoardIndex === null) return;

    const boardDiv = document.createElement("div");
    boardDiv.classList.add("board");

    const addCardButton = document.createElement("button");
    addCardButton.textContent = "Додати картку";
    addCardButton.addEventListener("click", addCardToBoard);
    boardDiv.appendChild(addCardButton);

    renderCards(boardDiv);
    container.appendChild(boardDiv);
    setupDragAndDrop();
}

// Оновлення вибору дошки
document.getElementById("boardSelector").addEventListener("change", (e) => {
    selectedBoardIndex = parseInt(e.target.value, 10);
    renderBoards();
});

const ctx = document.getElementById("progress-chart").getContext("2d");
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Початок', 'День 1', 'День 2', 'День 3'],
            datasets: [{
                label: 'Прогрес',
                data: [0, 25, 50, 75],
                borderColor: '#4CAF50',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true
        }
    });





// Ініціалізація
updateBoardSelector();
});