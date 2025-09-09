const fileInput = document.getElementById("fileInput");
const plantPreview = document.getElementById("plantPreview");
const analysisDiv = document.getElementById("analysis");
const climateDiv = document.getElementById("climate");
const climateBtn = document.getElementById("climateBtn");
const robotImg = document.getElementById("robotImg");
const robotText = document.getElementById("robotText");

let mood = "happy";

// Upload + análise Plant.id
fileInput.addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  // Mostra preview da imagem
  plantPreview.src = URL.createObjectURL(file);
  plantPreview.classList.remove("hidden");

  // Esconde análise anterior
  analysisDiv.classList.add("hidden");
  analysisDiv.innerText = "";

  // Lê a imagem como base64
  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result.split(",")[1];

    // Chama a API Plant.id v3
    analysisDiv.innerText = "Analisando...";
    analysisDiv.classList.remove("hidden");

    try {
      const response = await fetch("https://api.plant.id/v3/identification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": "myJNVf6JjbsxiwKL53UVE0R9NoGk8taAWHhkbjN47Hhqc9CAFd",
        },
        body: JSON.stringify({
          images: [base64Image],
          organs: ["leaf"], // Teste apenas com "leaf"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro detalhado:", errorData);
        throw new Error("Erro ao consultar a API Plant.id: " + (errorData.message || response.status));
      }
      const data = await response.json();

      // Mostra o resultado formatado
      if (
        data.result &&
        data.result.classification &&
        data.result.classification.suggestions &&
        data.result.classification.suggestions.length > 0
      ) {
        const best = data.result.classification.suggestions[0];
        analysisDiv.innerHTML = `
          <strong>Identificação:</strong> ${best.name}<br>
          <strong>Probabilidade:</strong> ${(best.probability * 100).toFixed(1)}%<br>
          <strong>Família:</strong> ${best.details.family}<br>
          <strong>Gênero:</strong> ${best.details.genus}
        `;
      } else {
        analysisDiv.innerText = "Nenhuma planta identificada.";
      }
    } catch (error) {
      analysisDiv.innerText = "Erro: " + error.message;
    }
  };
  reader.readAsDataURL(file);
});

// Clima simulado
climateBtn.addEventListener("click", () => {
  climateDiv.innerHTML = `
    <h3>🌍 Condições Climáticas</h3>
    <p><b>🌡️ Temperatura:</b> 28°C</p>
    <p><b>💦 Umidade:</b> 65%</p>
    <p><b>☔ Previsão:</b> Chuva prevista amanhã</p>
  `;
  climateDiv.classList.remove("hidden");

  setMood("angry");
});

// Controle de humor do robô
function setMood(newMood) {
  mood = newMood;
  if (mood === "happy") {
    robotImg.src = "robohappy.png";
    robotText.textContent = "🌟 Estou feliz! Sua planta parece saudável.";
  } else if (mood === "sad") {
    robotImg.src = "robot_sad.png";
    robotText.textContent = "😟 Estou preocupado, detectei um problema na planta.";
  } else if (mood === "angry") {
    robotImg.src = "robot_angry.png";
    robotText.textContent = "⚠️ Atenção! O clima pode afetar sua horta.";
  }
}
