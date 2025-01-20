import { expect, test } from '@playwright/test'

test('homepage has Attendance in title', async ({ page }) => {
  await page.goto('http://localhost:3000')

  const title = await page.title()
  expect(title).toContain('Attendance App')
})

test('successfully login', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  await page.fill('input[name="email"]', 'fulan@example.com')
  await page.fill('input[name="password"]', 'asdf1234')

  const emailValue = await page.inputValue('input[name="email"]')
  const passwordValue = await page.inputValue('input[name="password"]')

  expect(emailValue).toBe('fulan@example.com')
  expect(passwordValue).toBe('asdf1234')

  const loginButton = page.locator('button[type="submit"]')
  await expect(loginButton).toBeVisible()
  await loginButton.click()

  await page.waitForURL('http://localhost:3000')
  expect(page.url()).toBe('http://localhost:3000/')
})
