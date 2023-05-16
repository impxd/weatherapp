import { test, expect } from '@playwright/test';

const URL = 'http://localhost:4200/'

test.describe('testing the UI', () => {
  test('basic UI interaction and state', async ({ page }) => {
    await page.route(/us-state-capitals\.json$/, async (route) => {
      await sleep(100)
      return route.continue()
    });

    await page.goto(URL)

    const select = page.getByTestId('capitals-select')
    const button = page.getByTestId('capitals-clear-btn')

    // Select exists
    await expect(select).toBeVisible()

    // Clear button is hidden until you select a capital
    await expect(button).toBeHidden()

    // It shows a placeholder that says loading...
    await expect(page.getByTestId('capitals-select-placeholder')).toHaveText(/loading/i)

    // After it loads it says select an option
    await expect(page.getByTestId('capitals-select-placeholder')).toHaveText(/select/i)

    // Select some option
    await select.selectOption({ index: 2 })

    // Expects the URL to contain latLng query param
    await expect(page).toHaveURL(/latLng=/);

    // Clear button now should be visible.
    await expect(button).toBeHidden()

    // Should see a forecast.
    await expect(page.getByTestId('forecast')).toBeVisible()
  })
})

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
