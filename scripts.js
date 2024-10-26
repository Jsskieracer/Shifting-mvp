const logElement = document.getElementById("log");
const startButton = document.getElementById("startButton");
let audioContext, audioBuffers = {}, mediaStream, googleApiKey, silenceDetectionActive = true;

function logMessage(message) {
    logElement.textContent += message + "\n";
    logElement.scrollTop = logElement.scrollHeight;
}

async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioFiles = ['Intro', 'Prompt1', 'Calm_response', 'Supportive_response'];
        for (const file of audioFiles) {
            audioBuffers[file] = await loadAudioBuffer(file);
        }
        logMessage("Audio buffers loaded.");
    } catch (error) {
        logMessage("Error initializing audio context or loading buffers: " + error);
    }
}

async function loadAudioBuffer(fileName) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/Jsskieracer/Shifting-mvp/main/audio/${fileName}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        logMessage(`Error loading audio buffer for ${fileName}: ${error}`);
    }
}

async function playAudioBuffer(bufferName, delayAfter = 0) {
    try {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[bufferName];
        source.connect(audioContext.destination);
        source.start();

        logMessage(`${bufferName} started playing.`);

        const bufferDuration = source.buffer.duration;
        await new Promise(resolve => setTimeout(resolve, (bufferDuration + delayAfter) * 1000));
        logMessage(`${bufferName} finished playing. Waiting for ${delayAfter} seconds.`);
    } catch (error) {
        logMessage(`Error playing ${bufferName}: ${error}`);
    }
}

async function requestMicrophoneAccess() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        logMessage("Microphone access granted");
    } catch (error) {
        logMessage("Microphone access denied: " + error);
        return false;
    }
    return true;
}

async function toggleSession() {
    if (startButton.classList.contains("active")) {
        endSession();
        return;
    }
    startButton.classList.add("active");
    startButton.textContent = "Stop Session";

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();
        logMessage("Audio context resumed.");
    }

    logMessage("Session starting...");

    const micAccessGranted = await requestMicrophoneAccess();
    if (!micAccessGranted) {
        endSession();
        return;
    }

    googleApiKey = await fetchGoogleApiKey();
    if (!googleApiKey) {
        logMessage("Google API key could not be retrieved. Ending session.");
        endSession();
        return;
    }

    await initAudio();
    await playAudioBuffer('Intro');
    await new Promise(resolve => setTimeout(resolve, 3000));
    logMessage("3-second delay completed after Intro.");
    await playAudioBuffer('Prompt1');

    logMessage("Prompt 1 segment finished; starting dynamic recording...");
    const userResponse = await captureDynamicInput();
    logMessage("User response captured: " + userResponse);

    const isCalm = await analyzeWithGPT(userResponse);
    if (isCalm) {
        logMessage("GPT analysis: User feels calm.");
        await playAudioBuffer('Calm_response');
    } else {
        logMessage("GPT analysis: User does not feel calm.");
        await playAudioBuffer('Supportive_response');
    }

    endSession();
}

function endSession() {
    silenceDetectionActive = false;
    startButton.classList.remove("active");
    startButton.textContent = "Start Session";
    
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
        });
        mediaStream = null; // Explicitly set to null
        logMessage("Microphone turned off and tracks disabled.");
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null; // Explicitly set to null
        logMessage("Audio context closed.");
    }

    logMessage("Session complete; stopping silence detection logging.");
}

async function fetchGoogleApiKey() {
    try {
        const response = await fetch("https://shifting-mvp.vercel.app/api/googleApiKey", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.googleApiKey;
    } catch (error) {
        logMessage("Error fetching Google API key: " + error.message);
        return null;
    }
}

async function analyzeWithGPT(transcription) {
    try {
        logMessage("Starting GPT analysis for transcription: " + transcription);
        const response = await fetch("https://Shifting-mvp.vercel.app/api/OpenaiRequest", {
            method: "POST", // Ensure this is set to POST
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ transcription }), // Ensure this body is being sent
        });

        // if (!response.ok) {
        //     const errorDetails = await response.text();
        //     throw new Error(`Error analyzing response with GPT: HTTP ${response.status} ${response.statusText}, Details: ${errorDetails}`);
        // }

        console.log("analyzeWithGPT response=", response);
        const data = await response.json();
        console.log("analyzeWithGPT data=", data);
        const gptText = data.text?.trim().toLowerCase();
        logMessage("GPT analysis response: " + gptText);
        return gptText === "calm";
    } catch (error) {
        logMessage("Error analyzing response with GPT: " + error.message);
        return false;
    }
}

async function captureDynamicInput() {
    return new Promise((resolve, reject) => {
        try {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            logMessage("Starting speech recognition...");
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                logMessage("Speech recognition result: " + transcript);
                resolve(transcript);
            };

            recognition.onspeechend = () => {
                logMessage("Speech recognition ended.");
                recognition.stop();
            };

            recognition.onerror = (event) => {
                logMessage("Speech recognition error: " + event.error);
                reject(event.error);
            };
        } catch (error) {
            logMessage("Error starting speech recognition: " + error);
            reject(error);
        }
    });
}
