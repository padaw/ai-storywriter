<script lang="ts">
    import { Game } from "../core.svelte";

    const game = Game.get();
</script>

<b
    class:text-lime-950={game.progress < 20}
    class:text-lime-800={game.progress >= 20 && game.progress < 40}
    class:text-lime-700={game.progress >= 40 && game.progress < 70}
    class:text-lime-600={game.progress >= 70}>{game.progress}%</b
>
