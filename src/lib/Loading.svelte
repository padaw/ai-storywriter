<script lang="ts">
    import { fade } from "svelte/transition";
    import loadingGif from "../../assets/loading.gif";
</script>

<div
    class="absolute top-0 left-0 h-full w-full flex opacity-40 justify-center items-center"
    in:fade
>
    <img src={loadingGif} alt="loading" class="aspect-square w-full max-w-40" />
</div>
