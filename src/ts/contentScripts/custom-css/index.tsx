import { Feature, isActive, getSetting } from '../../utils/settings'

export const config: Feature = {
    id: 'custom-css',
    name: 'Custom CSS',
    settings: [
        { type: 'textarea', id: 'css', onSave: (value: string) => setCss(value) },
    ]
}






isActive('custom-css').then(active => {
    if (active) {
        getSetting('custom-css', 'css').then((value: string) => {
            setCss(value)
        })
    }
})







const setCss = (value: string) => {
    if (document.getElementById('roam-custom-styles')) {
        document.getElementById('roam-custom-styles')!.innerHTML = value
        return;
    }

    const style = document.createElement('style');
    style.id = 'roam-custom-styles';
    style.innerHTML = value;
    document.getElementsByTagName('head')[0].appendChild(style);
}