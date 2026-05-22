import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.context().clearCookies();
});

test('adding and deleting cart items', async ({ page }) => {
	await page.goto('/products/astro-unisex-tshirt', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Add to cart' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Astro Logo T-Shirt'),
	).toBeVisible();

	await page.goto('/products/astro-sticker-pack', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Add to cart' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Houston Sticker Sheet'),
	).toBeVisible();

	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-total')).toContainText(
		'30.00',
	);

	await page
		.getByRole('dialog', { name: 'Cart' })
		.getByRole('button', { name: 'Remove item' })
		.first()
		.click();

	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Astro Logo T-Shirt'),
	).not.toBeVisible();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Houston Sticker Sheet'),
	).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-total')).toContainText(
		'8.00',
	);

	await new Promise((r) => setTimeout(r, 100));

	await page
		.getByRole('dialog', { name: 'Cart' })
		.getByRole('button', { name: 'Remove item' })
		.first()
		.click();

	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Astro Logo T-Shirt'),
	).not.toBeVisible();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Houston Sticker Sheet'),
	).not.toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-empty')).toBeVisible();
});
