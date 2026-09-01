import os
import django
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sfms.settings')

app = Celery('sfms')

# Initialize Django first
django.setup()

# Load config from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks ONLY from task modules, not URLs
def autodiscover_tasks_safe():
    from django.apps import apps
    from importlib import import_module
    
    for config in apps.get_app_configs():
        # Only import 'tasks' module, not URLs
        try:
            import_module(f'{config.name}.tasks')
        except (ImportError, AttributeError):
            pass

app.autodiscover_tasks = autodiscover_tasks_safe
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
