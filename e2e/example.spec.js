import { test, expect } from '@playwright/test';

/*test('TEST 1: la Home di WIKIBLANK viene caricata correttamente', async ({ page }) => {

    await page.goto('/');

    await expect(page).toHaveTitle(/WIKIBLANK/i);

    await expect(
        page.getByRole('link', { name: 'WIKIBLANK' })
    ).toBeVisible();

});*/

test('TEST 2:un nuovo utente può registrarsi', async ({ page }) => {

    await page.goto('/register');

    /*
        Generiamo dati diversi ad ogni esecuzione
        per evitare l'errore "utente già esistente".
    */
    const uniqueId = Date.now();

    const username = `testuser${uniqueId}`;
    const email = `test${uniqueId}@wikiblank.it`;
    const password = 'Test1234!';

    // Compiliamo il form di registrazione
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    // Registrazione
    await page.getByRole('button', {
        name: 'Registrati'
    }).click();

    /*
        Register.jsx effettua automaticamente
        il login e poi torna alla Home.
    */
    await expect(page).toHaveURL('/');

    // Controlliamo che il token sia stato salvato
    const token = await page.evaluate(() =>
        localStorage.getItem('token')
    );

    expect(token).not.toBeNull();

    // Controlliamo anche l'utente salvato
    const savedUser = await page.evaluate(() =>
        localStorage.getItem('user')
    );

    expect(savedUser).not.toBeNull();
});