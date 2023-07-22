<script lang="ts">
	export let data;
</script>

<main class="container">
	<h1>Admin panel</h1>

	<div class="image-grid">
		{#each data.images as image}
			<div>
				<figure>
					<figcaption>{image.split('_')[2]}</figcaption>
					<!-- svelte-ignore a11y-missing-attribute -->
					<img src={'https://dgg-place.s3.amazonaws.com/' + image} />
				</figure>
				<a href="/admin/{image}">
					<button class="small">Merge</button>
				</a>
			</div>
		{/each}
	</div>
</main>

<style>
	.image-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}
	button.small {
		padding: 0.25rem;
	}
</style>
