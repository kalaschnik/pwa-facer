# ![PWA Facer Logo](public/favicon-32x32.png) PWA Facer
*A Progressive WebApp (PWA) utilizing Microsoft’s Face API*
PASTE SCREENSHOT (GIF) HERE

## About
This project was part of the class *Knowledge- and Content Management*  during winter term 18/19 in the department of *Natural Language Processing*, held by Prof. Dr. Gerhard Heyer & Dr. Thomas Efer at Leipzig University.

This project consists of two components. (1) A Progressive Web App, which enables the user to take and store photos (of faces to fulfill the purpose), and (2) the capability to analyze faces in regards to various aspects, such as: *Age, Emotions, Gender, Pose, Smile, and Facial Hair*, etc.

A field of application for this App is to code facial expressions as they may indicate a emotions, such as the seven basic emotion defined by Ekman (i.e., Rage, Anger, Contempt, Disgust, Fear, Joy, Happiness, Sadness and Surprise)[1]. See also Darwin’s *The Expression of the Emotions in Man and Animals*[2]

## Microsoft Face API
The Face API is a subset of Microsoft’s Cognitive Services

https://azure.microsoft.com/en-us/services/cognitive-services/face/

## Progressive Web Apps
### What is a Progressive Web App?
A Progressive Web App (PWA) is a website that has many features that were previously reserved for native apps, such as: **working offline, push notifications, and device hardware access**. Thus, PWAs combine the flexibility of the web with the experience of a native application. 

Without further ado 

Note the entire code was done in a manuel manner with
https://serviceworke.rs/
https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/

Although there a helper tools, most notably
https://developers.google.com/web/tools/workbox/


## Replicate

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You only need to have Node.js installed on your machine. Then follow the steps:

### Installing

1. Clone the project and cd into it:

    ```
    git clone https://github.com/Kalaschnik/pwa-facer.git
    ```

2. cd into it
    ```
    cd pwa-facer
    ```
3. install required packages, its only one: http-server
    ```
    npm install
    ```
4. start the project
    ```
    npm start
    ```    
5. Open browser
    ```
    http://localhost:8080
    ```    
## Deployment
Todo

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


[1]: Ekman, Paul (1999), Basic Emotions, in Dalgleish, T; Power, M (eds.), Handbook of Cognition and Emotion (PDF), Sussex, UK: John Wiley & Sons

[2]: Darwin, C. (1872). The expression of the emotions in man and animals. London, England: John Murray.
http://dx.doi.org/10.1037/10001-000