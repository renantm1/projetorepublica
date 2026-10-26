import { expect, test, type Page } from '@playwright/test';
async function startGame(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova campanha', exact: true }).click();
  await page.getByLabel('Nome', { exact: true }).fill('Marina');
  await page.getByLabel('Sobrenome', { exact: true }).fill('Almeida');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Assumir a Presidência' }).click();
  await expect(page.getByRole('heading', { name: 'Visão geral', exact: true })).toBeVisible();
}
async function nav(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Navegação do gabinete' })
    .getByRole('button', { name, exact: true })
    .click();
}
async function decide(page: Page) {
  await page.getByRole('button', { name: 'Avançar mês', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('.event-choice:not(:disabled)').first().click();
}
test('cria candidatura, resolve decisão, promulga lei e restaura o salvamento', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await startGame(page);
  await expect(page.locator('.brazil-map path')).toHaveCount(27);
  await decide(page);
  await page.getByRole('button', { name: 'Avançar mês', exact: true }).click();
  await expect(page.locator('.topbar-date')).toContainText('fevereiro de 2027');
  await nav(page, 'Políticas públicas');
  await page
    .locator('.policy-card')
    .filter({ has: page.getByRole('heading', { name: 'Pacto pela atenção básica', exact: true }) })
    .getByRole('button', { name: 'Propor ampliação' })
    .click();
  await expect(page.getByRole('heading', { name: 'Congresso', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Votar na Câmara' }).click();
  await expect(page.getByRole('button', { name: 'Votar no Senado' })).toBeVisible();
  await page.getByRole('button', { name: 'Votar no Senado' }).click();
  await page.getByRole('button', { name: 'Sancionar lei' }).click();
  await expect(page.locator('.bill-meta')).toContainText('EM VIGOR');
  await nav(page, 'Histórico');
  await expect(page.getByRole('heading', { name: 'Lei promulgada' })).toBeVisible();
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Continuar campanha', exact: true }).click();
  await expect(page.locator('.topbar-profile')).toContainText('Marina Almeida');
  await nav(page, 'Políticas públicas');
  await expect(page.locator('.policy-card').first()).toContainText('Em implantação');
  await nav(page, 'Mapa do Brasil');
  await page.getByRole('button', { name: /^Bahia:/ }).click();
  await expect(page.getByRole('heading', { name: 'Bahia', exact: true })).toBeVisible();
  await nav(page, 'Configurações');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar partida' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('almeida');
  const savedPath = await download.path();
  await page.getByRole('button', { name: 'Avançar mês', exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles(savedPath!);
  await page.getByRole('button', { name: 'Importar e continuar' }).click();
  await expect(page.locator('.topbar-date')).toContainText('fevereiro de 2027');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'invalido.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version": 999}'),
  });
  await expect(page.getByRole('status')).toContainText('incompatível ou corrompido');
  await expect(page.locator('.topbar-date')).toContainText('fevereiro de 2027');
  expect(errors).toEqual([]);
});
test('todas as seções respondem e o mapa permite busca', async ({ page }) => {
  await startGame(page);
  for (const name of [
    'Presidência',
    'Economia',
    'Congresso',
    'Políticas públicas',
    'Eleições',
    'Mapa do Brasil',
    'Partidos',
    'Notícias',
    'Rel. internacionais',
    'Histórico',
    'Configurações',
  ]) {
    await nav(page, name);
    await expect(page.locator('#main-content h1')).not.toBeEmpty();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
  }
  await nav(page, 'Mapa do Brasil');
  await page.getByRole('textbox', { name: 'Buscar estado' }).fill('Bahia');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Bahia');
  await nav(page, 'Eleições');
  await page.getByRole('button', { name: /Entrevista à imprensa/ }).click();
  await page.getByRole('button', { name: 'Realizar agenda' }).click();
  await expect(page.locator('.election-stats')).toContainText('1/2');
  await nav(page, 'Rel. internacionais');
  await page.getByRole('button', { name: 'Abrir negociação' }).first().click();
  await page.getByRole('button', { name: 'Firmar acordo' }).click();
  await expect(page.locator('.agreements')).toContainText('EM IMPLEMENTAÇÃO');
});
test('um mandato de quatro anos termina com apuração e balanço', async ({ page }) => {
  test.setTimeout(120000);
  await startGame(page);
  for (let turn = 0; turn < 48; turn++) {
    const event = await page.evaluate(
      () => !!JSON.parse(localStorage.getItem('republica.campaign.v1')!).eventId,
    );
    if (event) await decide(page);
    const phase = await page.evaluate(
      () => JSON.parse(localStorage.getItem('republica.campaign.v1')!).elections.phase,
    );
    if (phase === 'runoff') {
      await nav(page, 'Eleições');
      await page.getByRole('button', { name: 'Apurar 2º turno' }).click();
    }
    await page.getByRole('button', { name: 'Avançar mês', exact: true }).click();
  }
  await expect(page.getByRole('dialog')).toContainText('BALANÇO DO MANDATO');
  await expect(page.getByRole('button', { name: 'Mandato concluído', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Rever o histórico' }).click();
  await expect(page.getByRole('heading', { name: 'Balanço de um mandato' })).toBeVisible();
  const result = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('republica.campaign.v1')!),
  );
  expect(result.turn).toBe(48);
  expect(result.finished).toBe(true);
  expect(result.elections.phase).toBe('complete');
});
test('navegação móvel, teclado e configurações acessíveis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startGame(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  await expect(page.getByRole('button', { name: 'Abrir navegação' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await nav(page, 'Mapa do Brasil');
  await expect(page.getByRole('heading', { name: 'Mapa do Brasil', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Acre:/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Acre', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await nav(page, 'Configurações');
  await page.getByRole('checkbox', { name: /Reduzir movimento/ }).check();
  await expect(page.locator('html')).toHaveClass(/reduce-motion/);
  await page.getByRole('button', { name: 'Como governar' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
