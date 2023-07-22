<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let submitting = false;
	let converting = false;
	let imageSrc: any = null;

	function onFileChange(e: Event) {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			imageSrc = e.target.result;
		};
	}

	$: console.log(form);
</script>

<main class="container">
	<hgroup>
		<h1>Pixel art converter for the Daliban's r/place crusade</h1>
		<h2>Your image will be converted to a format usable by the script.</h2>
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
		<input
			type="file"
			accept="image/png"
			name="image"
			on:change={onFileChange}
			class="file-input"
		/>
		{#if imageSrc}
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src={imageSrc} class="preview-img" />
		{/if}
		<!-- <label> -->
		<!-- 	Name of your artwork -->
		<!-- 	<input type="text" name="name" /> -->
		<!-- </label> -->
		<!-- Position of the top left pixel of your artwork on r/place -->
		<!-- <div class="grid"> -->
		<!-- 	<label> -->
		<!-- 		X -->
		<!-- 		<input type="number" name="x" min="-500" max="999" /> -->
		<!-- 	</label> -->
		<!-- 	<label> -->
		<!-- 		Y -->
		<!-- 		<input type="number" name="y" min="-500" max="499" /> -->
		<!-- 	</label> -->
		<!-- </div> -->
		<button type="submit" formaction="?/convert" aria-busy={converting} class:secondary={converting}
			>Convert</button
		>
		<!-- <button type="submit" formaction="?/submit" aria-busy={submitting} class:secondary={submitting} -->
		<!-- 	>Submit</button -->
		<!-- > -->
	</form>

	{#if form?.conversionSuccess}
		<p class="success">
			<!-- svelte-ignore a11y-missing-attribute -->
			Image: <img src={form.imageUrl} />
			<br />
			Link: <a href={form.imageUrl}>{form.imageUrl}</a>
		</p>
	{:else if form?.submissionSuccess}
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
		/* color: black; */
		/* background-color: #efe; */
		border: 1px solid #0c0;
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
</style>
