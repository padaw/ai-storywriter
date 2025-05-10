<script lang="ts">
    import { data } from "../core.svelte";
</script>

<b
    class:text-lime-950={data.progress < 20}
    class:text-lime-800={data.progress >= 20 && data.progress < 40}
    class:text-lime-700={data.progress >= 40 && data.progress < 70}
    class:text-lime-600={data.progress >= 70}>{data.progress}%</b
>
