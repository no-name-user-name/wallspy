from django.core.management.base import BaseCommand

from parser.loop import activate


class Command(BaseCommand):
    help = 'Description of my command'

    def handle(self, *args, **kwargs):
        activate()
