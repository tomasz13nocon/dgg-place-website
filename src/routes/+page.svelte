<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let submitting = false;
</script>

<main class="container">
	<hgroup>
		<h1>Submit artwork for the Daliban's r/place crusade</h1>
		<h2>THE BEACONS ARE LIT! GONDOR CALLS FOR ARTISTS!</h2>
	</hgroup>
	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				update();
			};
		}}
	>
		Must be a PNG Image, transparent pixels will be ignored, make sure to only use colors availible
		on r/place
		<input type="file" accept="image/png" name="image" />
		<label>
			Name of your artwork
			<input type="text" name="name" />
		</label>
		Position of the top left pixel of your artwork on r/place
		<div class="grid">
			<label>
				X
				<input type="number" name="x" min="-500" max="999" />
			</label>
			<label>
				Y
				<input type="number" name="y" min="-500" max="499" />
			</label>
		</div>
		<button type="submit" aria-busy={submitting} class:secondary={submitting}>Submit</button>
	</form>

	{#if form?.success}
		<p class="success">
			"{form.name}" submitted successfully.<br />Once Destiny accepts it, it will show up on r/place
			with the script.
		</p>
	{:else if form?.error}
		<p class="error">{form.error}</p>
	{/if}
</main>

<style>
	.error,
	.success {
		padding: 1rem;
		border-radius: 0.25rem;
	}
	.success {
		color: black;
		background-color: #cfc;
		border: 1px solid #0c0;
	}
	.error {
		color: black;
		background-color: #fcc;
		border: 1px solid #c00;
	}
</style>
