const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { check, validationResult } = require('express-validator');
const fs = require('fs');

const app = express();
const port = 3000;



app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('form', { errors: null });
});

app.post('/submit', [
  check('imie').isLength({ min: 2, max:20 }).withMessage('Imię musi zawierać co najmniej 2 znaki i nie więcej niż 20'),
  check('wiek').custom(value => {
    if (isNaN(value) || value < 18 || value > 100) {
      throw new Error('Musisz mieć co najmniej 18 lat, ale też nie więcej niż 100 xd');
    }
    return true;
  }),
  check('email').isEmail().withMessage('Niepoprawny format adresu email.'),
], (req, res, next) => {
  const { imie, wiek, email } = req.body;

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return res.render('results', { imie, wiek, email });
  }

  // Jeśli są błędy, przekazujemy do obsługi błędów
  next(errors.array());
});

// Dodajemy middleware do obsługi błędów
app.use((err, req, res, next) => {
  res.render('form', { errors: err });
});

// Dodajemy middleware do zapisu błędów do pliku
app.use((err, req, res, next) => {
    console.log("widzisz mnie?");
  if (err instanceof Error) {
    const errorLog = `Date and Time: ${new Date().toLocaleString()}\nMethod: ${req.method}\nURL: ${req.originalUrl}\nError: ${err.message}\n\n`;

    // Zapis do pliku
    fs.writeFile('test.txt', errorLog, (fileErr) => {
      if (fileErr) {
        console.error('Błąd podczas zapisu do pliku error.log:', fileErr);
      }
    });
  }

  next(err);
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
