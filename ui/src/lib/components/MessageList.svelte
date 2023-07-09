<script lang="ts">
    import { getAppContext } from '$lib/app-context'

    const {
        data: { messages = [] },
    } = getAppContext()
</script>

{#if messages.length > 0}
    <div class="container">
        {#each messages as message}
            <div class="alert">
                {#if message.url}
                    <a href={message.url} target="_blank" rel="noreferrer"
                        >{message.text}</a
                    >
                {:else}
                    {message.text}
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    a {
        color: unset;
    }

    .container {
        margin: 10px 0;
    }

    .alert {
        padding: 15px;
        margin-bottom: 5px;
        background-color: #ff9800;
        color: white;
        border-radius: 10px;
    }
</style>
