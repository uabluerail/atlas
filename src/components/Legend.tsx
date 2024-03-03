import { FC, Dispatch, SetStateAction } from "react";
import {
    knownClusterNames,
    knownOverlayClusterColorMappings
} from "../staticData/clusterInfo"

interface LegendProps {
    legend: boolean;
    setLegend: Dispatch<SetStateAction<boolean>>;
    moderation: boolean;
}

const Legend: FC<LegendProps> = ({ legend, setLegend, moderation }) => {
    return (
        <div className="overflow-scroll bg-white shadow sm:rounded-md absolute transform
    mobile:left-1/2 mobile:top-2 mobile:left-2 mobile:right-2 mobile:w-fit mobile:h-1/2
    desktop:right-1/2 desktop:top-5 desktop:right-5 desktop:w-3/7 desktop:h-1/2
    translate-x-0 mt-auto z-50">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                    <div className="ml-4 mt-2">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Детальніше про кластери
                        </h3>
                    </div>
                    <div className="ml-4 mt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setLegend(!legend);
                            }}
                            className={
                                `relative inline-flex items-center rounded-md  px-3 py-2 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                (legend
                                    ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                    : " bg-green-500 hover:bg-green-600 focus-visible:ring-green-500")
                            }
                        >
                            {legend ? "Приховати" : "Показати"}
                        </button>
                    </div>
                </div>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <h5 className="text-sm font-semibold leading-10 text-gray-600">
                        Загальні риси
                    </h5>
                    <p>
                        На цій представлені акаунти і взаємодії між ними.
                    </p>
                    <p className="mt-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Сині стрілочки</span> - взаємодії ДО вас.
                    </p>
                    <p className="mt-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Червоні стрілочки</span> - взаємодії ВІД вас.
                    </p>
                    <p className="mt-2">
                        Всі стрілочки - це агреговані і зважені взаємодії: логарифмічна сума лайків, реплаїв та підписок.
                    </p>
                    <h5 className="text-sm font-semibold leading-10 text-gray-600">
                        Українські кластери 🇺🇦
                    </h5>
                    <p className="mb-5">
                        Українські кластери на цій мапі представлені максимально деталізовано.
                        Також додано можливість увімкнути деталізацію по спільнотам.
                        Максимальна кількість вихідних (червоних) стрілочок від кожної кульки - 10.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('ua-extended')}
                        </span> - Український мета-кластер. Тут зосереджена більшість української спільноти Bluesky.
                    </p>
                    <div>
                        <h5 className="text-sm font-semibold leading-10 text-gray-600">
                            Українські cпільноти 🇺🇦
                        </h5>
                        <p>
                            Українські спільноти - це експериментальний поділ мета-кластеру <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {knownClusterNames.get('ua-extended')}
                            </span> на менші групи.
                        </p>
                        <p className="mt-2">
                            Увімкнути спільноти можна в меню відміти "Показати спільноти"
                        </p>
                        <p className="mt-2">
                            Поділ відбувається виключно за взаємодіями.
                            Наприклад, багато Українських художників можна знайти в кластері шитпосту, а не в кластері художників.
                        </p>
                        <p className="mt-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-church') }}>
                                ■■■■
                            </span> - Спільнота Церкви Святого Інвайту ⛪🟡📘.
                        </p>
                        <p className="mb-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-fun') }}>
                                ■■■■
                            </span> - Шитпост спільнота 💃💅.
                        </p>
                        <p className="mb-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-art') }}>
                                ■■■■
                            </span> - Cпільнота митців: художників, крафтерів, косплеєрів.
                        </p>
                        <p className="mb-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-write') }}>
                                ■■■■
                            </span> - Cпільнота укррайт, к-поп та фандомів.
                        </p>
                        <p className="mb-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-lgbtqa') }}>
                                ■■■■
                            </span> - Олди з твіттера?
                            Цей опис потребує доповнення, якщо ви знайшли себе тут - зверніться до нас з пропозиціями опису!
                        </p>
                        <p className="mb-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-gaming') }}>
                                ■■■■
                            </span> - Ютубери, ґеймери
                        </p>
                        <p className="mb-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100"
                                style={{ color: knownOverlayClusterColorMappings.get('ua-tech') }}>
                                ■■■■
                            </span> - Українська tech-спільнота
                        </p>
                    </div>
                    <h5 className="text-sm font-semibold leading-10 text-gray-600">
                        Глобальні кластери 🌍
                    </h5>
                    <p className="mb-5">
                        Увага! Глобальні кластери на цій мапі представлені частково в цілях оптимізації. Максимальна кількість вихідних (червоних) стрілочок - 5. Повну мапу блускай можна знайти {" "}
                        <a
                            href="https://bsky.jazco.dev/atlas"
                            target="_blank"
                            className="font-bold underline-offset-1 underline"
                        > тут
                        </a>
                        {" "} (Atlas від Jaz, більше не оновлюється) a також  {" "}
                        <a
                            href="https://aurora.ndimensional.xyz"
                            target="_blank"
                            className="font-bold underline-offset-1 underline"
                        > тут
                        </a>
                        {" "} (Aurora від syntacrobat)
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('nafo')}
                        </span> - [REDACTED].
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('gamers')}
                        </span> - Розробники ігор, геймери з усього світу.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('artists')}
                        </span> - Художники, митці з усього світу.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('writers')}
                        </span> - Глобальна спільнота письменників, фікрайтерів.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('furry')}
                        </span> - Глобальна спільнота фурі.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('tech')}
                        </span> - Глобальна IT-спільнота.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('infosec')}
                        </span> - Глобальна InfoSec-спільнота.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('startup')}
                        </span> - Стартапери з усього світу.
                    </p>
                    <p className="mb-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {knownClusterNames.get('web3')}
                        </span> - Футуризм, web3.
                    </p>
                    {moderation && (
                        <div>
                            <h5 className="text-sm font-semibold leading-10 text-gray-600">
                                Модераційні кластери
                            </h5>
                            <p className="mb-2">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {knownClusterNames.get('ua-boroshno')}
                                </span> - Осередок російських інформаційно-психологічних операцій за допомогою ботоферм на території України.
                                Тут проживають як ботоферми і ботоводи, так і просто одурені українці, які легко ведуться та поширюють ІПСО,
                                конспірологію, біолабораторії Єрмака, та розмінування Чонгару інопланетянами.
                            </p>
                            <p className="mb-5">
                                Увага! Бойкотуйте контент країн агресорів: {" "}
                                <a
                                    href="https://mobik.zip"
                                    target="_blank"
                                    className="font-bold underline-offset-1 underline"
                                > mobik.zip
                                </a>
                            </p>
                            <p className="mb-2">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {knownClusterNames.get('ru')}
                                </span> - російські акаунти
                            </p>
                            <p className="mb-2">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {knownClusterNames.get('be')}
                                </span> - білоруські акаунти
                            </p>
                            <p className="mb-2">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {knownClusterNames.get('ru-other')}
                                </span> - кластер глобальної російськомовної спільноти. Населений переважно росіянами.
                                Також присутні акаунти з інших держав, що існують переважно в російському інфопросторі.
                            </p>
                        </div>
                    )}
                    <h5 className="text-sm font-semibold leading-10 text-gray-600">
                        Детальніше про кластеризацію
                    </h5>
                    <p>
                        Важливо розрізняти візуалізацію та кластеризацію, хоч вони і пов'язані, але будуються на різних алгоритмах.
                    </p>
                    <p className="mt-2">
                        Кластеризація (фарбування) - реалізується за допомогою алгоритму Leiden на 3х різних налаштуваннях:
                    </p>
                    <p>
                        слабка (розрізняє великі мета-кластери та виявляє найбільшу кількість кульок, але не враховує взаємність взаємодій),
                    </p>
                    <p>
                        точна (розрізняє середні та великі кластери, має більшу точність бо враховує взаємніть) та
                    </p>
                    <p>
                        детальна (виявляє спільноти по-інтересам всередині більших кластерів).
                    </p>
                    <p className="mt-2">
                        Візуалізація - реалізується за допомогою алгоритму Force Atlas 2. Саме він візуально симулює силу тяжіння на основі взаємодій та групує кульки докупи.
                        Можна помітити, що візуальне групування та кластеризація перетинаються, але дуже важливо їх розрізняти,
                        бо на цьому атласі ми бачимо роботу 4х алгоритмів: 1 для візуалізації (гравітаційне групування), 3 інших - для багатошарової кластеризації.
                    </p>
                    {/* <h5 className="text-sm font-semibold leading-10 text-gray-600">
            Детальніше про алгоритми
          </h5>
          <p className="mt-2">
            Force Atlas 2 (візуалізація: гравітаційне групування):
          </p>
          <p className="mt-2">
            <pre>
              ForceAtlas2(
            </pre>
            <pre>
              iterations: 800,
            </pre>
            <pre>
              barnesHutTheta:1.5,
            </pre>
            <pre>
              weight: leidenUndirectedMax
            </pre>
            <pre>
              )
            </pre>
            - візуальне групування
          </p>
          <p className="mt-2">
            Слабкий Leiden (кластеризація: кульки блідого кольору):
          </p>
          <p className="mt-2">
            <pre>
              Leiden(
            </pre>
            <pre>
              gamma: 30,
            </pre>
            <pre>
              edges: ['likes', 'replies', 'follows'],
            </pre>
            <pre>
              edgeAggregation: undirectedSum,
            </pre>
            <pre>
              aggregatedWeight: sumCount,
            </pre>
            <pre>
              calculateSignificance: false
            </pre>
            <pre>
              )
            </pre>
            - цей алгоритм рахується лише для деяких кластерів. Кульки позначаються блідішим кольором, ніж основний колір кластеру.
            Цей алгоритм захоплює найбільшу кількість акаунтів, навіть малоактивних,
            добре підходить для перепису населення, але менш точний, бо не враховує взаємність
          </p>
          <p className="mt-2">
            Гармонічний Leiden (кластеризація: основні кольори):
          </p>
          <p className="mt-2">
            <pre>
              Leiden(
            </pre>
            <pre>
              gamma: 50,
            </pre>
            <pre>
              edges: ['likes', 'replies', 'follows'],
            </pre>
            <pre>
              undirectedAggregation: MAX,
            </pre>
            <pre>
              edgeAggregation: harmonicMeanSumLog,
            </pre>
            <pre>
              calculateSignificance: true
            </pre>
            <pre>
              )
            </pre>
            - враховує взаємність інтеракцій за допомогою проєкції ненаправленого графу в направлений через Harmonic Mean:
            для кожних двох акаунтів А, B рахується гармонійне середнє взаємодій aggregatedEdgeWeight(A,B) та aggregatedEdgeWeight(B, A)
            і саме вона передається як результуюча вага в ненаправлений граф.
            Сам aggregatedEdgeWeight рахується із урахуванням глобальних і індивідуальних ваг взаємодій.
            Охоплює на 20% менше акаунтів ніж слабкий Leiden, але є набагато більш точним і має вищу confidense.
          </p>
          <p className="mt-2">
            Детальний Leiden (кластеризація: додаткові кольори спільнот):
          </p>
          <p className="mt-2">
            <pre>
              Leiden(
            </pre>
            <pre>
              gamma: 100,
            </pre>
            <pre>
              edges: ['likes', 'replies', 'follows'],
            </pre>
            <pre>
              undirectedAggregation: MAX,
            </pre>
            <pre>
              edgeAggregation: harmonicMeanSumLog,
            </pre>
            <pre>
              calculateSignificance: true
            </pre>
            <pre>
              )
            </pre>
            - всі параметри співпадають із Гармонійним Leiden, але прораховуються на більшій гаммі для виявлення детальніших спільнот
          </p>
          <p className="mt-2">
            Глобальні значення ваг:
          </p>
          <pre>
            [ likes: 31, replies: 62, follows: 7]
          </pre>
          <p className="mt-2">
            Персональні значення ваг:
          </p>
          <pre>
            personalSignificanceFollows = 1 - 1/totalInteractions
          </pre>
          <pre>
            personalSignificanceReplies = 1 - userTotalReplies/totalInteractions
          </pre>
          <pre>
            personalSignificanceLikes   = 1 - userTotalLikes/totalInteractions
          </pre>
          <p className="mt-2">
            Алгоритм охоплює таку саму кількість акаунтів як і гармонійний Leiden, але розбиває на більшу кількість спільнот.
          </p> */}
                </div>
            </div>
        </div>
    )
}

export default Legend;