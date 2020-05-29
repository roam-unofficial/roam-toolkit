/**
 * This is a single entry file for things to be loaded as content script.
 * Any file to be loaded should be included directly or transitively (from other files)
 */

import '../../features/features'
import '../../features/dispatcher'
import '../../features/fuzzy_date'

//detect when roam is loaded
const target = document.getElementById('app')
if (target) {
    // Wait for Roam to load before initializing
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            const newNodes = mutation.addedNodes // DOM NodeList
            if (newNodes !== null) {
                // If there are new nodes added
                for (let node of newNodes as NodeListOf<Element>) {
                    if (node.classList.contains('roam-body')) {
                        // body has loaded
                        console.log('roam loaded')
                        document.dispatchEvent(new CustomEvent('roam-loaded', {detail: new Date()}))
                        observer.disconnect()

                        //for the first 60 seconds, run the scripts every 3 seconds to load initially
                        for (let time = 0; time <= 60000; time += 3000) {
                            setTimeout(function () {
                                document.dispatchEvent(new CustomEvent('roam-toolkit-tick', {}))
                            }, time)
                        }

                        //after that, run the scripts every 15 seconds indefinately
                        setInterval(function () {
                            document.dispatchEvent(new CustomEvent('roam-toolkit-tick', {}))
                        }, 15000)
                    }
                }
            }
        })
    })

    observer.observe(target, {
        attributes: true,
        childList: true,
        characterData: true,
    })
    //console.log('Observer running...')
}

document.addEventListener(
    'focus',
    function (evt) {
        document.dispatchEvent(new CustomEvent('roam-toolkit-tick', {...evt}))
    },
    true
)
