import { test, expect } from '@playwright/test';

/*test('TEST 1: la Home di WIKIBLANK viene caricata correttamente', async ({ page }) => {

    await page.goto('/');

    await expect(page).toHaveTitle(/WIKIBLANK/i);

    await expect(
        page.getByRole('link', { name: 'WIKIBLANK' })
    ).toBeVisible();

});*/

// test('TEST 2:un nuovo utente può registrarsi', async ({ page }) => {

//     await page.goto('/register');

//     /*
//         Generiamo dati diversi ad ogni esecuzione
//         per evitare l'errore "utente già esistente".
//     */
//     const uniqueId = Date.now();

//     const username = `testuser${uniqueId}`;
//     const email = `test${uniqueId}@wikiblank.it`;
//     const password = 'Test1234!';

//     // Compiliamo il form di registrazione
//     await page.getByLabel('Username').fill(username);
//     await page.getByLabel('Email').fill(email);
//     await page.getByLabel('Password').fill(password);

//     // Registrazione
//     await page.getByRole('button', {
//         name: 'Registrati'
//     }).click();

//     /*
//         Register.jsx effettua automaticamente
//         il login e poi torna alla Home.
//     */
//     await expect(page).toHaveURL('/');

//     // Controlliamo che il token sia stato salvato
//     const token = await page.evaluate(() =>
//         localStorage.getItem('token')
//     );

//     expect(token).not.toBeNull();

//     // Controlliamo anche l'utente salvato
//     const savedUser = await page.evaluate(() =>
//         localStorage.getItem('user')
//     );

//     expect(savedUser).not.toBeNull();
// });

// test('TEST 3:un utente registrato può effettuare il login', async ({ page, request }) => {

//     const uniqueId = Date.now();

//     const username = `loginuser${uniqueId}`;
//     const email = `login${uniqueId}@wikiblank.it`;
//     const password = 'Test1234!';

//     /*
//         Prepariamo un utente nel database.
//         La registrazione tramite interfaccia è già
//         verificata dal Test 2.
//     */
//     const registerResponse = await request.post(
//         'http://localhost:3000/api/register',
//         {
//             data: {
//                 username,
//                 email,
//                 password
//             }
//         }
//     );

//     expect(registerResponse.ok()).toBeTruthy();

//     // Apriamo la pagina di login
//     await page.goto('/login');

//     // Inseriamo credenziali corrette
//     await page.getByLabel('Email').fill(email);
//     await page.getByLabel('Password').fill(password);

//     await page.getByRole('button', {
//         name: 'Accedi'
//     }).click();

//     // Dopo il login Login.jsx porta alla Home
//     await expect(page).toHaveURL('/');

//     // Il token deve essere stato salvato
//     const token = await page.evaluate(() =>
//         localStorage.getItem('token')
//     );

//     expect(token).not.toBeNull();

//     // Anche l'utente deve essere salvato
//     const savedUser = await page.evaluate(() =>
//         localStorage.getItem('user')
//     );

//     expect(savedUser).not.toBeNull();
// });

// test('TEST 4:il login con credenziali errate mostra un errore', async ({ page }) => {

//     await page.goto('/login');

//     // Inseriamo credenziali volutamente errate
//     await page.getByLabel('Email').fill(
//         'utenteinesistente@wikiblank.it'
//     );

//     await page.getByLabel('Password').fill(
//         'PasswordSbagliata123!'
//     );

//     // Proviamo ad accedere
//     await page.getByRole('button', {
//         name: 'Accedi'
//     }).click();

//     // L'utente deve rimanere nella pagina di login
//     await expect(page).toHaveURL('/login');

//     // Deve comparire il messaggio di errore
//     await expect(
//         page.locator('.login-error')
//     ).toBeVisible();

//     // Non deve essere stato salvato nessun token
//     const token = await page.evaluate(() =>
//         localStorage.getItem('token')
//     );

//     expect(token).toBeNull();
// });

// test('TEST 5:un utente non autenticato non può creare una partita', async ({ request }) => {

//     const response = await request.post(
//         'http://localhost:3000/api/games'
//     );

//     // Senza token JWT il middleware authToken
//     // deve bloccare la richiesta
//     expect(response.status()).toBe(401);
// });

test('TEST 6:un utente autenticato può creare una nuova partita', async ({ page, request }) => {

    const uniqueId = Date.now();

    const username = `gameuser${uniqueId}`;
    const email = `game${uniqueId}@wikiblank.it`;
    const password = 'Test1234!';

    // Creiamo un nuovo utente
    const registerResponse = await request.post(
        'http://localhost:3000/api/register',
        {
            data: {
                username,
                email,
                password
            }
        }
    );

    expect(registerResponse.ok()).toBeTruthy();

    // Effettuiamo il login tramite API
    const loginResponse = await request.post(
        'http://localhost:3000/api/login',
        {
            data: {
                email,
                password
            }
        }
    );

    expect(loginResponse.ok()).toBeTruthy();

    const loginData = await loginResponse.json();

    // Apriamo prima il sito per avere accesso al localStorage
    await page.goto('/');

    // Salviamo token e utente come fa Login.jsx
    await page.evaluate(
        ({ token, user }) => {
            localStorage.setItem('token', token);
            localStorage.setItem(
                'user',
                JSON.stringify(user)
            );
        },
        {
            token: loginData.token,
            user: loginData.user
        }
    );

    // Andiamo alla pagina Gioca
    await page.goto('/play');

    // Avviamo realmente la partita dalla UI
    await page.getByRole('button', {
        name: 'Inizia partita'
    }).click();

    // Dopo la creazione dobbiamo arrivare a /game/ID
    await expect(page).toHaveURL(
        /\/game\/\d+/
    );
});

