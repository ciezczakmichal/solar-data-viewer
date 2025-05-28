<script lang="ts">
    import { getAppContext } from '$lib/global/app-context'

    const {
        data: { messages = [] },
    } = getAppContext()
</script>

{#if messages.length > 0}
    <div class="pb-1 pt-3">
        {#each messages as message, i (i)}
            <div class="alert-orange alert mb-1">
                <!-- TODO zastąpić ikoną z projektu -->
                <svg
                    class="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                    ></path>
                </svg>

                {#if message.url}
                    <a
                        class="link-hover link"
                        href={message.url}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {message.text}
                    </a>
                {:else}
                    {message.text}
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .alert-orange {
        background-color: #ff9800;
        color: white;
    }
</style>
