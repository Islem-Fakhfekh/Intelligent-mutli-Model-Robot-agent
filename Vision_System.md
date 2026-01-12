# R2D2 Vision System : Perception Stéréoscopique & Cognitive (SPI/ROS 2/VLM)

Ce dépôt contient l'intégralité du sous-système de perception visuelle du robot mobile autonome **R2D2**. Il implémente une **vision stéréoscopique** (3D) imitant la vision humaine pour servir de "Radar Optique", couplée à une intelligence artificielle hybride (YOLO + VLM) pour la compréhension sémantique de l'environnement.

Le système est intégré dans une architecture distribuée pilotée par le contexte (**FIWARE Orion Context Broker**) et communique via **ROS 2**.

---

## 📑 Table des Matières

1. [Architecture du Système](https://www.google.com/search?q=%231-architecture-du-syst%C3%A8me)
2. [Matériel et Câblage (Critique)](https://www.google.com/search?q=%232-mat%C3%A9riel-et-c%C3%A2blage-spi-hspi)
3. [Firmware des "Yeux" (ESP32-CAM)](https://www.google.com/search?q=%233-firmware-des-yeux-esp32-cam)
4. [Le "Cerveau" (Raspberry Pi & Python)](https://www.google.com/search?q=%234-le-cerveau-driver-python--pipeline-ia)
5. [Mathématiques de la Stéréovision](https://www.google.com/search?q=%235-math%C3%A9matiques--calcul-distance--d%C3%A9viation)
6. [IA Cognitive : YOLO & VLM](https://www.google.com/search?q=%236-ia-cognitive--yolo--vlm)
7. [Intégration ROS 2 & Navigation](https://www.google.com/search?q=%237-int%C3%A9gration-ros-2--navigation)
8. [Défis Techniques & Solutions (Troubleshooting)](https://www.google.com/search?q=%238-d%C3%A9fis-techniques--solutions-rencontr%C3%A9es)
9. [Guide d'Installation Pas à Pas](https://www.google.com/search?q=%239-guide-dinstallation-pas-%C3%A0-pas)

---

## 1. Architecture du Système

Pour contourner les limitations de bande passante USB et réduire les coûts, nous avons opté pour une architecture **Maître/Esclave** sur bus SPI.

* **Le Maître (Raspberry Pi 4) :** Orchestre la capture, récupère les images brutes, exécute les réseaux de neurones (YOLO) et publie les données de navigation sur ROS 2.
* **Les Esclaves (2x ESP32-CAM) :** Capturent des images haute résolution synchronisées. Ils agissent comme des buffers intelligents.
* **Communication :** Protocole **SPI (Serial Peripheral Interface)** personnalisé. Contrairement à l'UART (Série) trop lent, le SPI permet un transfert rapide (~300ms/image) et robuste.

---

## 2. Matériel et Câblage (SPI HSPI)

C'est la partie la plus sensible du projet. Une erreur ici entraîne des "Timeouts" ou des caméras grillées.

### Composants Requis

* 1x Raspberry Pi 4 Model B (8GB recommandés pour l'IA).
* 2x ESP32-CAM (Module AI-Thinker).
* 1x Convertisseur de tension ou alimentation 5V stable (3A min).
* Fils de connexion (Dupont) de haute qualité (courts de préférence).

### ⚡ Schéma de Câblage (Pinout)

Nous utilisons le bus **HSPI** de l'ESP32 car le bus VSPI est occupé par la caméra interne.

| Signal SPI | Raspberry Pi (Pin Physique) | ESP32-CAM (GPIO) | Rôle |
| --- | --- | --- | --- |
| **5V** | **Pin 2 ou 4** | **5V / VCC** | **CRITIQUE :** Alimentation. Ne JAMAIS utiliser le 3.3V (Pin 1) sous peine de *Brownout*. |
| **GND** | **Pin 6, 9, 14...** | **GND** | Masse commune obligatoire pour la référence du signal. |
| **SCLK** | **Pin 23 (GPIO 11)** | **GPIO 14** | Horloge (Clock) synchronisée par le Pi. |
| **MISO** | **Pin 21 (GPIO 9)** | **GPIO 12** | Master In Slave Out (Envoi de l'image). |
| **MOSI** | **Pin 19 (GPIO 10)** | **GPIO 13** | Master Out Slave In (Envoi des commandes). |
| **CS 1 (Gauche)** | **Pin 24 (GPIO 8)** | **GPIO 15** | Chip Select pour activer la caméra Gauche. |
| **CS 2 (Droite)** | **Pin 26 (GPIO 7)** | **GPIO 15** | Chip Select pour activer la caméra Droite. |

> **⚠️ ATTENTION :**
> 1. **PAS DE CARTE SD :** N'insérez aucune carte SD dans les ESP32-CAM. Les pins `Data 1` et `Data 0` de la SD entrent en conflit physique avec le HSPI.
> 2. **RESET :** Si la caméra ne répond pas, appuyez sur le bouton `RST` de l'ESP32.
> 
> 

---

## 3. Firmware des "Yeux" (ESP32-CAM)

Le code (C++ Arduino) transforme l'ESP32 en périphérique SPI passif.

* **Bibliothèque utilisée :** `ESP32SPISlave`.
* **Logique :**
1. Initialise la caméra en mode JPEG.
2. Attend la commande `'C'` (Capture) ou `'D'` (Data) via SPI.
3. Capture l'image et la stocke dans la PSRAM (RAM externe de 4Mo).
4. Découpe l'image en paquets (Chunks) de 4096 octets pour l'envoi.



*Le code source complet se trouve dans le dossier `/arduino_firmware`.*

---

## 4. Le "Cerveau" (Driver Python & Pipeline IA)

Le script principal sur le Raspberry Pi (`r2d2_vision.py`) gère le pipeline complet.

### Driver SPI Personnalisé

Nous utilisons `spidev` pour communiquer directement avec le matériel.

```python
import spidev
spi = spidev.SpiDev()
spi.open(0, 0) # Bus 0, Device 0
spi.max_speed_hz = 2000000 # 2MHz (Stable sur fils volants)
# Envoi de la commande de capture
spi.xfer2([ord('C')]) 

```

### Pipeline de Traitement

1. **Acquisition :** Récupération séquentielle (Gauche puis Droite) des buffers JPEG.
2. **Décodage :** Conversion `bytes` -> `numpy array` via OpenCV (`cv2.imdecode`).
3. **Inférence IA :** Passage dans YOLOv8.
4. **Calculs Géométriques :** Estimation de la distance et de l'angle.

---

## 5. Mathématiques : Calcul Distance & Déviation

Le système fonctionne comme un "Radar Visuel". Nous utilisons la géométrie épipolaire simplifiée (caméras alignées parallèlement).

### A. La Baseline ()

Distance physique entre les deux objectifs des caméras.

* **Valeur choisie :** .
* **Pourquoi ?** C'est le "Sweet Spot" pour détecter des objets entre 50cm et 4m.

### B. Calcul de la Profondeur ()

Pour un objet détecté, nous trouvons son centre dans l'image gauche () et droite (). La différence est la **disparité** ().


La distance  est donnée par la formule de triangulation :



*Où  est la focale de la caméra (en pixels, environ 600px pour une résolution VGA).*

### C. Calcul de la Déviation ()

Pour que le robot sache s'il doit tourner à gauche ou à droite.


*  : Obstacle à gauche.
*  : Obstacle à droite.

---

## 6. IA Cognitive : YOLO & VLM

Le robot ne se contente pas de voir des obstacles, il les identifie.

### Détection Rapide : YOLOv8 Nano

* **Modèle :** `yolov8n.pt` (entraîné sur COCO).
* **Performance :** ~8-12 FPS sur CPU Raspberry Pi 4.
* **Sortie :** Bounding Box, Classe (ex: "Person", "Chair"), Confiance.

### Compréhension Sémantique : VLM (Vision Language Model)

Dans des situations ambiguës (ex: "Est-ce un sac poubelle ou un rocher ?"), le système active le module VLM.

* **Technologie :** Appel API (ou modèle local quantifié type `LLaVA` ou `CLIP` si ressources dispo).
* **Prompt :** *"Décris l'obstacle devant moi et indique s'il est dangereux pour un robot à roues."*
* **Résultat :** Texte JSON injecté dans le Context Broker.

---

## 7. Intégration ROS 2 & Navigation

Le module vision publie des messages standards ROS 2 pour être consommés par le stack de navigation (`Nav2`) et le Context Broker.

* **Node Name :** `stereo_vision_node`
* **Topics Publiés :**
* `/camera/left/image_raw` (`sensor_msgs/Image`) : Flux vidéo pour débogage.
* `/perception/obstacles` (`geometry_msgs/PointStamped`) : Coordonnées X,Y,Z des obstacles.
* `/context/vision_data` (`std_msgs/String`) : JSON complet pour FIWARE.



**Interaction avec FIWARE Orion :**
Le nœud met à jour l'entité `Robot:R2D2` dans le Context Broker via des requêtes HTTP (NGSIv2), permettant au Digital Twin de visualiser l'état du robot en temps réel.

---

## 8. Défis Techniques & Solutions Rencontrées

Ce projet a nécessité de surmonter plusieurs obstacles majeurs documentés dans nos rapports.

| Défi | Symptôme | Solution Appliquée |
| --- | --- | --- |
| **Alimentation (Brownout)** | La LED rouge de l'ESP32 s'éteint, pas de réponse WiFi/SPI. | Utilisation stricte des pins **5V** du Pi (pas 3.3V) et changement des câbles USB de mauvaise qualité. |
| **Lenteur UART** | Latence de 4 secondes par image, images coupées ("Header missing"). | Abandon de l'UART pour le **SPI**. Gain de vitesse x10. |
| **Conflit NumPy/ROS 2** | Erreur `numpy.core.multiarray failed to import` sous ROS Humble. | Rétrogradation forcée de NumPy : `pip install "numpy<2"`. |
| **Fils Croisés** | "Timeout" lors de la connexion SPI. | Vérification minutieuse : MISO va sur MISO, MOSI sur MOSI (contrairement à l'UART qui croise RX/TX). |

---

## 9. Guide d'Installation Pas à Pas

### Étape 1 : Préparation du Raspberry Pi

```bash
# 1. Mise à jour et dépendances
sudo apt update && sudo apt install -y python3-opencv python3-spidev python3-pip

# 2. Installation des bibliothèques Python
pip3 install ultralytics pyserial requests
# CORRECTIF CRITIQUE POUR ROS 2 :
pip3 install "numpy<2" --force-reinstall

# 3. Activation du SPI
sudo raspi-config
# -> Interface Options -> SPI -> YES -> Reboot

```

### Étape 2 : Flashage des ESP32

1. Installer **Arduino IDE**.
2. Ajouter le gestionnaire de cartes ESP32.
3. Ouvrir le fichier `.ino` fourni dans `/arduino_code`.
4. Sélectionner la carte "AI Thinker ESP32-CAM".
5. Téléverser le code (utiliser un adaptateur FTDI externe, ne pas brancher au Pi pendant le flash !).

### Étape 3 : Lancement

```bash
# Lancer le driver et la détection
python3 r2d2_main_vision.py

```

---

## 👥 Équipe et Crédits

Projet réalisé dans le cadre du module **Projet Tuteuré SUP'COM D2R2**.

* **Étudiants :** Islem Fakhfekh, Saif Eddine Ben Turkia, Asma Mhatli, Mohamed Amine Abderrazek.
* **Encadrants :** M. Ali BEN BRAHIM, M. Khaled Grati.
* **Ressources :** Basé sur les travaux de documentation ROS 2, Ultralytics YOLO et la communauté ESP32.
