import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.context().clearCookies();
});

test('adding and deleting cart items', async ({ page }) => {
	await page.goto('/products/lightroom', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Add to cart' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Adobe Lightroom'),
	).toBeVisible();

	await page.goto('/products/illustrator', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Add to cart' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Adobe Illustrator'),
	).toBeVisible();

	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-total')).toContainText(
		'32.98',
	);

	await page
		.getByRole('dialog', { name: 'Cart' })
		.getByRole('button', { name: 'Remove item' })
		.first()
		.click();

	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Adobe Lightroom'),
	).not.toBeVisible();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Adobe Illustrator'),
	).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-total')).toContainText(
		'22.99',
	);

	await new Promise((r) => setTimeout(r, 100));

	await page
		.getByRole('dialog', { name: 'Cart' })
		.getByRole('button', { name: 'Remove item' })
		.first()
		.click();

	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Adobe Lightroom'),
	).not.toBeVisible();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Adobe Illustrator'),
	).not.toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-empty')).toBeVisible();
});
