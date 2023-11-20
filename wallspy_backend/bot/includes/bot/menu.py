# from captcha.image import ImageCaptcha
from telebot import types
from telebot.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from bot.includes.bot import get_bot
from bot.includes.bot import long_text as lt
from bot.includes.temp import users

bot = get_bot()


def render(cid, msg, reply_markup=None, mid=None, photo=None, entities=None, dn=True, dw=True) -> Message:
    if cid in users.list():
        users.find(cid).last_mid = mid

    if not mid:
        if photo:
            return bot.send_photo(cid, photo, caption=msg, disable_notification=dn, reply_markup=reply_markup)
        return bot.send_message(
            cid, text=msg, disable_notification=dn, reply_markup=reply_markup, disable_web_page_preview=dw)

    else:
        if photo:
            try:
                return bot.edit_message_media(
                    media=types.InputMediaPhoto(
                        media=photo,
                        caption=msg, parse_mode='HTML'),
                    chat_id=cid,
                    message_id=mid,
                    reply_markup=reply_markup
                )
            except:
                try:
                    bot.delete_message(cid, mid)
                except:
                    print('[!] Can`t Delete prev message')
                return render(cid, msg, reply_markup, photo=photo)
        else:
            try:
                if entities:
                    return bot.edit_message_text(msg, cid, mid, parse_mode=None, disable_web_page_preview=dw,
                                                 entities=entities, reply_markup=reply_markup)

                else:
                    return bot.edit_message_text(
                        msg, cid, mid, reply_markup=reply_markup, disable_web_page_preview=dw)
            except:
                try:
                    bot.delete_message(cid, mid)
                except:
                    print('[!] Can`t Delete prev message')

                return render(cid, msg, reply_markup)


def main(cid, mid=None, custom_message=None):
    users.find(cid).step = 'MAIN_MENU'
    markup = InlineKeyboardMarkup()

    msg = '<b>Welcome! 🤟</b>\n\n ' \
          'Launch the <a href="https://t.me/wallspybot/WallSpy">Wallet Spy Bot</a>!\n\n' \
          '#BetaBuild'

    if custom_message:
        msg = custom_message

    render(cid, msg, markup, mid, dw=False)


# ==== custom ==========#

def simple_message(cid, mid, msg, back_callback, user_step, back_text='◂ Назад'):
    users.find(cid).step = user_step
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(back_text, callback_data=back_callback))

    return render(cid, msg, markup, mid)


# ========== NEWBIE =========== #

def new_user_hello(cid, mid=None):
    user = users.find(cid)
    user.step = 'CAPTCHA'

    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton('🔄 Обновить', callback_data='v=captcha_update'))

    msg = 'Введите каптчу:'
    m = render(cid, msg, markup, mid)
    user.last_mid = m.message_id


def success_captcha(cid, mid=None):
    users.find(cid).step = 'SUCCESS_CAPTCHA'
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton('✏️ Подать заявку', callback_data='v=newbie_form&m=rules'))
    msg = lt.intro()
    render(cid, msg, markup, mid)


def newbie_rules(cid, mid=None):
    users.find(cid).step = 'NEWBIE_RULES'
    users.find(cid).form_flush()

    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton('✅ Ознакомился', callback_data='v=newbie_form&m=quest&id=0'))
    msg = lt.rules()
    render(cid, msg, markup, mid)