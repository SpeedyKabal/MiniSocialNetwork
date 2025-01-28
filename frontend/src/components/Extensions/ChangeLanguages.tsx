import React from 'react'
import { useTranslation } from 'react-i18next'

function ChangeLanguages() {
    const { i18n } = useTranslation();

    const lngs = {
        en: { nativeName: "English" },
        fr: { nativeName: "Français" },
        ar: { nativeName: "العربية" },
    };

    return (
        <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="text-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
        >
            {Object.keys(lngs).map((lng) => (
                <option key={lng} value={lng}>
                    {lngs[lng].nativeName}
                </option>
            ))}
        </select>
    )
}

export default ChangeLanguages