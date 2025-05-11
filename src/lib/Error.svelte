<script lang="ts" module>
    const headers: Record<string, string> = {
        api: "API Error",
        server: "Server Error",
        logic: "Logic Error",
    };
    const descriptions: Record<string, string> = {
        api: "There was an error with Google Gemini AI's API response.",
        server: "There was an error while attempting to connect to the server.",
        logic: "You found a bug in the game. Good for you, I guess?",
    };
</script>

<script lang="ts">
    import type { AppError } from "./core.svelte";

    let { error } = $props<{ error: AppError }>();
</script>

<div
    class="bg-red-100 absolute top-0 left-0 h-full w-full flex flex-col gap-4 justify-center items-center"
>
    <h1
        class="text-red-700 font-black text-3xl w-max py-1 px-2 border-4 border-red-800"
    >
        {headers[error]}
    </h1>
    <p class="text-center font-mono w-2/3">
        {descriptions[error]}
    </p>
    <p class="font-bold text-black text-center w-2/3">Please contact me :(</p>
</div>
