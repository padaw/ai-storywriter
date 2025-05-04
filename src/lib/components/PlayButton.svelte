<script lang="ts">
    let { action, text } = $props<{ action: Function; text: string }>();
</script>

<button
    class="font-bold font-sans text-xl leading-8 text-violet-100 bg-gradient-to-br from-violet-400 to-violet-600 border-2 border-violet-400 rounded-md px-8 py-2 shadow-violet-800 shadow-lg active:border-violet-800 transition-all"
    style="text-shadow: 1px 2px 2px #000"
    onclick={action}>{text}</button
>
