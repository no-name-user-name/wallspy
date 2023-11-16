# ================== NEWBIES =================#
def intro():
    return f"""
💸 Добро пожаловать.
"""


def rules():
    return """
<b>ПРАВИЛА</b>
"""


def chat_list(w, p):
    return f"""
<b>💭 ЧАТЫ!</b>
➖➖➖➖➖➖➖➖➖
💭 <a href="{w}">Рабочий чат</a>
"""


# ============= custom ===========

def simple_msg(title: str, msg: str = None):
    if msg:
        return f"""
<b>{title.upper()}</b>
{msg}
"""
    else:
        return f"""
<b>{title.upper()}</b>
"""


def alert(title, msg, is_error=False):
    if is_error:
        pre1 = '🔴'
        pre2 = '❗️'
    else:
        pre1 = '❇'
        pre2 = '🗯'
    return f"""
<b>{pre1} {title.upper()}</b>
➖➖➖➖➖➖➖➖➖➖➖
{pre2} {msg}
"""


def newbie():
    return f"""

"""
