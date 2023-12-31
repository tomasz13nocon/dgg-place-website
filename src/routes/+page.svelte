<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let converting = false;
	let showPositionFields = false;
	let imageSrc: string | undefined;

	function onFileChange(e: Event) {
		let image = (e.target as HTMLInputElement)!.files![0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			imageSrc = e.target!.result as string;
		};
	}
</script>

<main class="container">
	<hgroup>
		<h1>Pixel art converter for r/place</h1>
		<h2>
			Converts image to the format ready for inclusion as a template in the script. Can also
			automatically merge with a provided template.
		</h2>
	</hgroup>

	<div class="example-container">
		<img src="/dgg-logo-medium.png" alt="conversion preview" />
		<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 16 16"
			><path
				fill="currentColor"
				d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018a.751.751 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z"
			/></svg
		>
		<img src="/dgg-logo-converted.png" alt="conversion preview" />
	</div>

	<form
		method="POST"
		use:enhance={() => {
			converting = true;
			return async ({ update }) => {
				converting = false;
				imageSrc = undefined;
				showPositionFields = false;
				update();
			};
		}}
	>
		Must be a PNG Image, transparent pixels will be ignored
		<input
			type="file"
			accept="image/png"
			name="image"
			on:change={onFileChange}
			class="file-input"
			required
		/>
		{#if imageSrc}
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src={imageSrc} class="preview-img" />
		{/if}
		<label class="merge-label">
			<input type="checkbox" name="merge" bind:checked={showPositionFields} />
			Merge with existing template
		</label>
		{#if showPositionFields}
			<span>
				Position of the top left pixel of your artwork on the provided template (not the r/place
				coordinates!).
				<br />
				For example if r/place top left coordinates are -500, -500 and you want to place your art at
				-400, -400 the position should be 100, 100.</span
			>
			<div class="grid">
				<label>
					X
					<input type="number" name="x" required />
				</label>
				<label>
					Y
					<input type="number" name="y" required />
				</label>
			</div>
			Template image to merge your image with
			<input type="file" accept="image/png" name="mergeImage" class="file-input" required />
		{/if}
		<button
			type="submit"
			formaction="?/convert"
			aria-busy={converting}
			class:secondary={converting}
		>
			Convert
		</button>
	</form>

	{#if form?.conversionSuccess}
		<p class="success conversion-success">
			Converted image:
			<br />
			<!-- svelte-ignore a11y-missing-attribute -->
			<img class="converted-img" src={form.imageUrl} />
			{#if form.templateUrl}
				<br />
				Template:
				<br />
				<!-- svelte-ignore a11y-missing-attribute -->
				<img class="converted-img" src={form.templateUrl} />
			{/if}
		</p>
	{:else if form?.error}
		<p class="error">{form.error}</p>
	{/if}
</main>

<style>
	main {
		margin: 4rem auto;
	}
	.error,
	.success {
		padding: 1rem;
		border-radius: 0.25rem;
	}
	.error {
		color: black;
		background-color: #fcc;
		border: 1px solid #c00;
	}
	.preview-img {
		max-height: 300px;
		margin-bottom: 1rem;
	}
	.converted-img {
		border: 1px solid #0c0;
		margin-top: 1rem;
	}
	.conversion-success {
		text-align: center;
	}
	.merge-label {
		margin-bottom: 1rem;
	}
	.example-container {
		text-align: center;
		margin-bottom: 2rem;
	}
</style>
