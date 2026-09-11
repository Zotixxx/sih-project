import 'package:flutter_test/flutter_test.dart';
import 'package:metrix_mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('renders LMO login screen', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const MetrixLmoApp());
    await tester.pump();

    expect(find.text('MetriX LMO'), findsOneWidget);
    expect(find.text('LMO Sign In'), findsOneWidget);
  });
}
