const express = require("express")
const agentes = require("./data/agentes.js")
const jwt = require("jsonwebtoken")
const app = express()
const path = require("path")

app.listen(3000, () => console.log("agentes.jsYour app listening on port 3000"))

app.use(express.static(path.join(__dirname +`index.html`)))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

//METODO SING 
//paso 1 Crear una constante llamada “secretKey” cuyo valor será “Mi Llave Ultra Secreta”. Esta será la llave que usaremos para firmar los tokens.
const secretKey = 'Mi Llave Ultra Secreta'

//PERSISTENCIA DE UN TOKEN 
// Crear una ruta /SignIn.
app.get("/SignIn", (req, res) => {
    // Extraer de las query Strings los parámetros email y password.
    const { email, password } = req.query;
    // Utilizar el método find para encontrar algún usuario que coincida con las credenciales recibidas.
    const agente = agentes.find((u) => u.email == email && u.password == password);
    // Declarar un condicional if que evalúe el resultado del método find, es decir, si se encontró un usuario con el email y password recibida.
    if (agente) {
        // Paso 5: En caso de encontrar un usuario, genera un token que expire en 2 minutos usando la instancia del usuario como data.
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: agente,
            },
            secretKey
        );
        // Paso 6: Luego de generar el token, responde al cliente con un hiper enlace que dirija a una ruta /restringida, le dé la bienvenida utilizando el dato del email y utilice un script con el método “setItem” de localStorage para persistir el token en el navegador
        res.send(`<style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-image: url('https://sucessoemvendas.pt/sv/wp-content/uploads/2020/03/como-usar-tecnicas-do-fbi-nas-vendas-1400x788.png');
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            color: white;
        }
        h1 {
            font-size: 3em;
        }
        p {
            font-size: 2em;
        }
    </style>
   <h1>Bienvenido, ${email}.</h1> 
  <a href="/restringido?token=${token}"> <p> Ir al area Restringida </p> </a>
  <script>
  localStorage.setItem('token', JSON.stringify("${token}"))
  </script>
  `);
    } else {
        // Paso 7: En caso de no encontrar un usuario (caso else) devolver el mensaje “Usuario o contraseña incorrecta”.
        res.send(`<style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            color: black;
        }
        h1 {
            font-size: 3em;
        }
        p {
            font-size: 2em;
        }
    </style>
        <h1>Usuario no autorizado</h1>
        <p>Lo siento, la combinación de usuario y contraseña no es válida.</p>
        <img src="https://lestor.cl/wp-content/uploads/2023/06/Personal-Autorizado.jpg" alt="Imagen de no autorizado" width="500">
        `);
    }
});

// Paso 1: Crear una ruta /restringido.
app.get("/restringido", (req, res) => {
    // Paso 2: Extraer de las query Strings el parámetro token y almacenarlo en una constante.
    let { token } = req.query;
    // Paso 3: Utilizar el método “verify” para verificar el token obtenido
    jwt.verify(token, secretKey, (err, decoded) => {
        // Paso 4: En caso de haber un error, devuelve el código de estado 401 y un JSON con la propiedad “message” del parámetro de error disponible en el callback del método “verify”
        err
            ? res.status(401).send({
                error: "Error 401 Unauthorized",
                message: err.message,
            })
            :// Paso 5: En caso de no existir ningún error, devolver el mensaje “Bienvenido al Dashboard ${decoded.email}”. Utilizamos el parámetro “decoded” para acceder a las propiedades del payload que se encontraba codificado en el token recibido.
            res.send(`<style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                background-image: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH8WSYoA9XzISUqwTVJiYJxJuO3TR0PSqpyw&s');
                background-size: cover;
                background-repeat: no-repeat;
                background-attachment: fixed;
                color: white;
            }
            h1 {
                font-size: 3em;
            }
        </style>
    <h1> Bienvenido ${decoded.data.email} </h1>
    `);
    });
});
