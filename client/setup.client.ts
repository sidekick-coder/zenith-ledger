import { adminRoute, route } from './utils/route'
import authGuard from '#client/guards/auth.guard'
import { defineClientSetup } from '#client/utils'
import { $t } from '#shared/lang'

export default defineClientSetup(({ menu, router }) => {
    router.auto(import.meta.glob<any>('./pages/**/*.vue'), {
        strip: ['pages'],
        refine: (records) =>  records.map(r => {
            if (r.path.startsWith('/admin')) {
                r.path = adminRoute(r.path.replace('/admin', ''))
                r.beforeEnter = [authGuard]
                return r
            }
    
            r.path = route(r.path)
    
            return r
        })
        
    })
    menu.add({
        id: 'accounts',
        label: 'Accounts',
        icon: 'BookType',
        to: adminRoute('/accounts'),
        group: $t('Ledger')
    })
})