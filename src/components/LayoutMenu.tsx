import { FC, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { getTranslation, getValueByLanguage } from "../common/translation";
import { config } from '../common/visualConfig';

interface LayoutMenuProps {
    moderator: boolean;
    currentLanguage: string;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function buildMenu(moderator: boolean, currentLanguage: string) {
    const menuItems: any[] = [];
    config.getAllLayouts(moderator).forEach(layout => menuItems.push(
        <Menu.Item
            key={layout.name}>
            {({ active }) => (
                <a
                    href={moderator ? `?lang=${currentLanguage}&moderator=${moderator}&layout=${layout.name}` : `?lang=${currentLanguage}&layout=${layout.name}`}
                    className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-xs'
                    )}
                >
                    {getValueByLanguage(layout.label, currentLanguage)}
                </a>

            )}
        </Menu.Item>
    ));
    return menuItems;
}

const LayoutMenu: FC<LayoutMenuProps> = ({ moderator, currentLanguage }) => {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute bottom-5 right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {buildMenu(moderator, currentLanguage)}
                    </div>
                </Menu.Items>
            </Transition>
            <div>
                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white mt-1 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {getTranslation('choose', currentLanguage)}{" "}<span className="hidden md:inline">{getTranslation('layout', currentLanguage)}</span>
                    <span className="md:hidden">{getTranslation('layout', currentLanguage)}</span>
                    <ChevronDownIcon className="-mr-1 -ml-1 h-4 w-4 text-gray-400" aria-hidden="true" />
                </Menu.Button>
            </div>
        </Menu>
    )
}

export default LayoutMenu;