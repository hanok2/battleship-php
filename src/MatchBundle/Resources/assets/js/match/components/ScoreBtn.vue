<template>
    <div :title="trans('Score')" class="bubble" @click="toggleModal()">
        <i class="gi gi-heart-organ"></i>
        <img id="life-bubble" src="img/null.png" width="25" height="25">
    </div>
</template>
<script>
    // Import
    import { mapState } from 'vuex'
    import { MUTATION } from "../store/mutation-types"

    import Favico from "@npm/favico.js/favico.js"
    let BubbleLife = null

    export default {
        data() {
            return {
                trans() {
                    return Translator.trans(...arguments)
                },
            }
        },
        computed: {
            ...mapState([
                'score', // Score module
            ]),
        },
        methods: {
            toggleModal() {
                this.$store.commit(MUTATION.SCORE.MODAL)
            },
        },
        watch: {
            // Update bubble when life change
            'score.life': (life) => {
                let color = (life < 10) ? '#FF0000' : (life > 20) ? '#008200' : '#B7B700';
                BubbleLife.badge(life, {bgColor: color })
            },
        },
        // Create bubble on mount
        mounted() {
            BubbleLife = new Favico({
                elementId: 'life-bubble',
                animation: 'slide'
            })
        },
    }
</script>
