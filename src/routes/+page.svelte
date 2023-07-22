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
		<h1>Pixel art converter for the Daliban's r/place crusade</h1>
		<h2>
			Converts image to the format ready for inclusion as a template in the script. Can also
			automatically merge with the existing template or a custom one provided by you.
		</h2>
	</hgroup>
	<form
		method="POST"
		use:enhance={() => {
			converting = true;
			return async ({ update }) => {
				converting = false;
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
			<span> Position of the top left pixel of your artwork on r/place </span>
			<div class="grid">
				<label>
					X
					<input type="number" name="x" min="-1000" max="999" required />
				</label>
				<label>
					Y
					<input type="number" name="y" min="-500" max="499" required />
				</label>
			</div>
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
	.error,
	.success {
		padding: 1rem;
		border-radius: 0.25rem;
	}
	.success {
		/* border: 1px solid #0c0; */
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
</style>
