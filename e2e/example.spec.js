import { test, expect } from '@playwright/test';

test('la Home di WIKIBLANK viene caricata correttamente', async ({ page }) => {

    await page.goto('/');

    await expect(page).toHaveTitle(/WIKIBLANK/i);

    await expect(
        page.getByRole('link', { name: 'WIKIBLANK' })
    ).toBeVisible();

});